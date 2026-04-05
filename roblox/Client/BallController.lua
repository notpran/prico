--[[
    BallController  (LocalScript – runs on each Roblox client)
    ──────────────────────────────────────────────────────────
    Client-side volleyball ball rendering and input handling.

    Responsibilities
    ─────────────────
    • Receive authoritative state from BallServer (position, velocity, spin).
    • Smooth the position using a critically-damped spring so jitter from
      network updates is invisible to the player.
    • Run a client-side physics prediction (same PhysicsService formulas)
      between server snapshots to keep the ball moving fluidly at 60 fps.
    • Rotate the ball mesh to visualise spin (cosmetic only).
    • Handle player input: detect when the local character is close enough
      to hit the ball, calculate an appropriate impulse, and fire BallHitEvent.

    No physics authority lives here – the server always wins.
    All visual smoothing is purely cosmetic.
--]]

local RunService        = game:GetService("RunService")
local UserInputService  = game:GetService("UserInputService")
local Players           = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- ── Wait for server to create remote events ────────────────────────────────
local BallRemotes    = ReplicatedStorage:WaitForChild("BallRemotes", 10)
local BallStateEvent = BallRemotes:WaitForChild("BallStateEvent",    10)
local BallHitEvent   = BallRemotes:WaitForChild("BallHitEvent",      10)

-- ── Module imports ─────────────────────────────────────────────────────────
local PhysicsService = require(game.ReplicatedStorage.Shared.PhysicsService)

-- ── Ball instance reference ────────────────────────────────────────────────
local ball = workspace:WaitForChild("VolleyBall", 10)

-- ── Local player reference ─────────────────────────────────────────────────
local localPlayer    = Players.LocalPlayer
local character      = localPlayer.Character or localPlayer.CharacterAdded:Wait()
local humanoidRootPart = character:WaitForChild("HumanoidRootPart")
-- Re-cache on respawn
localPlayer.CharacterAdded:Connect(function(newChar)
    character       = newChar
    humanoidRootPart = newChar:WaitForChild("HumanoidRootPart")
end)

-- ─────────────────────────────────────────────────────────────────────────
-- Smoothing state
-- ─────────────────────────────────────────────────────────────────────────

-- Render position / velocity (what the client actually displays)
local renderPos    = ball.Position
local renderVel    = Vector3.zero

-- Spring state for the critically-damped position corrector
local springVel    = Vector3.zero

-- Last authoritative snapshot from the server
local serverPos    = ball.Position
local serverVel    = Vector3.zero
local serverSpin   = Vector3.zero

-- Predicted state (extrapolated from last snapshot)
local predPos      = ball.Position
local predVel      = Vector3.zero
local predSpin     = Vector3.zero

-- Time since last server snapshot (used for prediction age)
local timeSinceUpdate = 0

-- How long we trust pure prediction before snapping harder toward the server
local MAX_PREDICTION_AGE = 0.25  -- seconds

-- Spring constants (critically damped: damping ≈ 2 × sqrt(stiffness))
local SPRING_STIFFNESS = 220
local SPRING_DAMPING   = math.sqrt(SPRING_STIFFNESS) * 2   -- ≈ 29.7

-- ─────────────────────────────────────────────────────────────────────────
-- Receive authoritative state from server
-- ─────────────────────────────────────────────────────────────────────────
BallStateEvent.OnClientEvent:Connect(function(pos, vel, spin)
    serverPos  = pos
    serverVel  = vel
    serverSpin = spin

    -- Re-seed the predictor from the fresh snapshot
    predPos    = pos
    predVel    = vel
    predSpin   = spin

    timeSinceUpdate = 0
end)

-- ─────────────────────────────────────────────────────────────────────────
-- Hit input handling
-- ─────────────────────────────────────────────────────────────────────────

-- Radius within which the player can hit the ball (studs)
local HIT_RANGE      = 6
-- Minimum time between local hit attempts (prevents input spam)
local HIT_COOLDOWN   = 0.25
local lastHitTime    = 0

-- Key binding: F to hit (can be changed to proximity prompt / UI button)
local HIT_KEY        = Enum.KeyCode.F

-- Calculates a hit velocity based on the relative positions of the player and ball.
-- Returns a Vector3 impulse that arcs toward the opposite court.
local function calculateHitImpulse(characterPos, ballPos)
    -- Direction from player to ball, projected up-and-forward
    local toCourt  = Vector3.new(-characterPos.X, 0, -characterPos.Z).Unit
    local hitDir   = (toCourt + Vector3.new(0, 0.6, 0)).Unit

    -- Scale power based on how close the ball is (closer = harder hit)
    local dist     = (ballPos - characterPos).Magnitude
    local power    = math.clamp(70 - dist * 4, 35, 70)

    return hitDir * power
end

-- Optionally fire a spike event – adds topspin for a downward curve
local function spikeImpulse(characterPos, ballPos)
    local toNet   = Vector3.new(-characterPos.X, 0, -characterPos.Z).Unit
    local hitDir  = (toNet * 0.85 + Vector3.new(0, -0.3, 0)).Unit
    local spin    = toNet:Cross(Vector3.new(0, 1, 0)) * 18  -- topspin

    return hitDir * 90, spin
end

UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    if input.KeyCode ~= HIT_KEY then return end

    local now = tick()
    if now - lastHitTime < HIT_COOLDOWN then return end

    -- Safety: make sure character is loaded
    if not humanoidRootPart then return end

    local charPos  = humanoidRootPart.Position
    local ballPos  = renderPos  -- use the smoothed visual position for feel

    local dist = (ballPos - charPos).Magnitude
    if dist > HIT_RANGE then return end  -- too far away

    lastHitTime = now

    -- Determine hit type: G = spike (gravity smash), F = normal bump/set
    local hitVel, hitSpin
    if UserInputService:IsKeyDown(Enum.KeyCode.G) then
        hitVel, hitSpin = spikeImpulse(charPos, ballPos)
    else
        hitVel  = calculateHitImpulse(charPos, ballPos)
        hitSpin = Vector3.zero
    end

    BallHitEvent:FireServer(hitVel, hitSpin)
end)

-- ─────────────────────────────────────────────────────────────────────────
-- RenderStepped: prediction + spring smoothing + visual updates
-- ─────────────────────────────────────────────────────────────────────────
RunService.RenderStepped:Connect(function(dt)
    timeSinceUpdate = timeSinceUpdate + dt

    -- 1. Advance client-side prediction using the same physics formulas
    --    as the server.  This bridges the gap between server snapshots and
    --    makes the ball move continuously at the client's frame rate.
    predPos, predVel = PhysicsService.stepPhysics(predPos, predVel, predSpin, dt)
    predSpin         = predSpin * math.exp(-1.5 * dt)   -- mirror server spin decay

    -- If prediction has drifted for too long, blend more aggressively
    local blendFactor = math.clamp(timeSinceUpdate / MAX_PREDICTION_AGE, 0, 1)
    -- (blendFactor 0 = trust prediction, 1 = snap to latest server snapshot)
    -- We use the spring to absorb the correction smoothly, so we only adjust
    -- the target – not the render position directly.
    local smoothTarget = predPos:Lerp(serverPos, blendFactor * 0.15)

    -- 2. Critically-damped spring: pull renderPos toward smoothTarget
    renderPos, springVel = PhysicsService.springLerpV3(
        renderPos,
        smoothTarget,
        springVel,
        SPRING_STIFFNESS,
        SPRING_DAMPING,
        dt
    )

    -- 3. Move the ball visual to the smoothed position.
    --    Accumulate incremental spin rotation so the ball visually rolls.
    --    We extract the current rotational CFrame, apply a small delta rotation
    --    based on spin magnitude, then re-compose with the new position.
    local prevRot   = ball.CFrame - ball.CFrame.Position   -- rotation-only CFrame
    local spinDelta = CFrame.Angles(
        predSpin.X * dt * 0.5,   -- cosmetic spin around each axis
        predSpin.Y * dt * 0.5,
        predSpin.Z * dt * 0.5
    )
    ball.CFrame = CFrame.new(renderPos) * prevRot * spinDelta
end)
