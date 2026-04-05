--[[
    BallServer  (Script – runs on the Roblox server)
    ───────────────────────────────────────────────
    Server-authoritative volleyball physics simulation.

    Responsibilities
    ─────────────────
    • Own the canonical ball state: position, velocity, angular velocity (spin).
    • Integrate physics each Heartbeat using PhysicsService (RK4, drag, Magnus).
    • Detect and resolve collisions with workspace geometry.
    • Broadcast authoritative state to clients via an UnreliableRemoteEvent
      at a fixed network tick rate to reduce bandwidth.
    • Expose a RemoteEvent so clients (and server scripts) can "hit" the ball
      (e.g. player bump / set / spike).
    • Apply hard speed caps and anti-cheat checks on incoming hit requests.

    Architecture note
    ──────────────────
    The ball BasePart is moved by setting its CFrame directly each frame
    (AssemblyLinearVelocity / Anchored = true).  This avoids the jitter
    that comes from fighting Roblox's built-in constraint solver at high
    replication rates.
--]]

local RunService    = game:GetService("RunService")
local Players       = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- ── Module imports ─────────────────────────────────────────────────────────
local PhysicsService = require(game.ReplicatedStorage.Shared.PhysicsService)

-- ── Remote events (created once, reused by BallController) ────────────────
-- BallStateEvent  – server → client  (position, velocity, spin)
-- BallHitEvent    – client → server  (hitVelocity)
local remoteFolder = ReplicatedStorage:FindFirstChild("BallRemotes")
    or Instance.new("Folder", ReplicatedStorage)
remoteFolder.Name = "BallRemotes"

local function getOrCreate(class, name)
    return remoteFolder:FindFirstChild(name)
        or Instance.new(class, remoteFolder)
end

local BallStateEvent = getOrCreate("UnreliableRemoteEvent", "BallStateEvent")
BallStateEvent.Name  = "BallStateEvent"

local BallHitEvent   = getOrCreate("RemoteEvent", "BallHitEvent")
BallHitEvent.Name    = "BallHitEvent"

-- ── Ball instance setup ────────────────────────────────────────────────────
-- The ball Part should already be in Workspace (placed in Studio).
-- If it doesn't exist yet we create a simple sphere for testing.
local ball = workspace:FindFirstChild("VolleyBall")
if not ball then
    ball          = Instance.new("Part")
    ball.Name     = "VolleyBall"
    ball.Shape    = Enum.PartType.Ball
    ball.Size     = Vector3.one * (PhysicsService.BALL_RADIUS * 2)
    ball.Color    = Color3.fromRGB(255, 255, 255)
    ball.Material = Enum.Material.SmoothPlastic
    ball.CastShadow = true
    ball.Parent   = workspace
end

-- Server controls position; disable Roblox physics on the part
ball.Anchored          = true
ball.CanCollide        = false  -- we handle collisions manually

-- ── Authoritative physics state ────────────────────────────────────────────
local state = {
    position = Vector3.new(0, 10, 0),  -- start in the air
    velocity = Vector3.new(0,  0, 0),
    spin     = Vector3.new(0,  0, 0),  -- angular velocity (rad/s)
    inPlay   = false,
}

-- Move ball to initial position
ball.CFrame = CFrame.new(state.position)

-- ── Network tick limiter ───────────────────────────────────────────────────
-- Broadcast authoritative state to clients ~30 times/second.
-- Physics integrates every Heartbeat (~60 Hz) for accuracy.
local NET_RATE       = 1/30   -- seconds between state broadcasts
local netAccumulator = 0

-- ── Collision detection helpers ────────────────────────────────────────────
local function castBallRay(origin, direction)
    local params = RaycastParams.new()
    params.FilterDescendantsInstances = { ball }
    params.FilterType = Enum.RaycastFilterType.Exclude
    return workspace:Raycast(origin, direction, params)
end

-- Detect and resolve sphere–environment collision for one physics sub-step.
-- Returns updated position, velocity after any bounce.
local function resolveCollisions(pos, vel)
    local r = PhysicsService.BALL_RADIUS

    -- Cast a short ray in the direction of travel to detect upcoming surface
    local speed = vel.Magnitude
    if speed < 0.01 then
        return pos, vel
    end

    local lookAhead = math.min(speed * 0.016 + r, r * 3)  -- look 1 frame ahead + radius
    local hit       = castBallRay(pos, vel.Unit * lookAhead)

    if hit then
        -- Move ball to the contact surface (offset by radius along normal)
        local contactPoint = hit.Position + hit.Normal * r
        -- Only correct position if we are actually inside/near the surface
        local penetration  = (contactPoint - pos):Dot(hit.Normal)
        if penetration > 0 then
            pos = pos + hit.Normal * penetration
        end
        vel = PhysicsService.reflectVelocity(vel, hit.Normal)
    end

    -- Hard floor clamp (belt-and-suspenders safety net)
    if pos.Y - r < workspace.FallenPartsDestroyHeight then
        pos = Vector3.new(pos.X, r + 0.01, pos.Z)
        vel = PhysicsService.reflectVelocity(vel, Vector3.new(0, 1, 0))
    end

    return pos, vel
end

-- ── Spin decay ─────────────────────────────────────────────────────────────
-- Angular velocity naturally decays due to air and surface friction.
local SPIN_DECAY_RATE = 1.5  -- rad/s²  – spin lost per second

local function decaySpin(spin, dt)
    local mag = spin.Magnitude
    if mag < 0.01 then
        return Vector3.zero
    end
    local newMag = math.max(0, mag - SPIN_DECAY_RATE * dt)
    return spin.Unit * newMag
end

-- ── Hit validation ─────────────────────────────────────────────────────────
-- Maximum plausible impulse a player can add (studs/s).
local MAX_HIT_SPEED   = 120
-- Minimum time between hits from the same player (seconds) – prevents spam.
local HIT_COOLDOWN    = 0.2
local lastHitTime     = {}  -- [Player] = tick()

BallHitEvent.OnServerEvent:Connect(function(player, hitVelocity, newSpin)
    -- Type guards
    if typeof(hitVelocity) ~= "Vector3" then return end
    if newSpin ~= nil and typeof(newSpin) ~= "Vector3" then return end

    -- Cooldown check
    local now   = tick()
    local last  = lastHitTime[player] or 0
    if now - last < HIT_COOLDOWN then return end
    lastHitTime[player] = now

    -- Speed cap (anti-cheat)
    local speed = hitVelocity.Magnitude
    if speed > MAX_HIT_SPEED then
        hitVelocity = hitVelocity * (MAX_HIT_SPEED / speed)
    end

    -- Apply the hit – add velocity impulse to the current ball velocity
    state.velocity = state.velocity + hitVelocity
    state.inPlay   = true

    -- Optionally apply spin from the hit (e.g. spike topspin)
    if newSpin then
        local spinMag = newSpin.Magnitude
        local spinCap = 25  -- rad/s max
        if spinMag > spinCap then
            newSpin = newSpin * (spinCap / spinMag)
        end
        state.spin = newSpin
    end
end)

-- Clean up cooldown table when players leave
Players.PlayerRemoving:Connect(function(player)
    lastHitTime[player] = nil
end)

-- ── Main physics loop ──────────────────────────────────────────────────────
RunService.Heartbeat:Connect(function(dt)
    if not state.inPlay then return end

    -- Clamp dt to avoid huge steps after lag spikes
    local safeDt = math.min(dt, 1/20)

    -- 1. Integrate physics (RK4: gravity + drag + Magnus)
    state.position, state.velocity = PhysicsService.stepPhysics(
        state.position,
        state.velocity,
        state.spin,
        safeDt
    )

    -- 2. Resolve geometry collisions (bounces)
    state.position, state.velocity = resolveCollisions(state.position, state.velocity)

    -- 3. Decay spin over time
    state.spin = decaySpin(state.spin, safeDt)

    -- 4. Move the anchored ball part to the new position
    ball.CFrame = CFrame.new(state.position)

    -- 5. Broadcast to clients at the network tick rate
    netAccumulator = netAccumulator + safeDt
    if netAccumulator >= NET_RATE then
        netAccumulator = netAccumulator - NET_RATE
        BallStateEvent:FireAllClients(state.position, state.velocity, state.spin)
    end
end)
