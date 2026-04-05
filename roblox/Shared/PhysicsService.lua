--[[
    PhysicsService
    Shared volleyball physics engine – constants, integrator, and helpers.

    Design goals
    ─────────────
    • Less floaty: gravity tuned up, drag rises with speed (quadratic law).
    • Responsive topspin / backspin: Magnus force curves the ball predictably.
    • Stable: RK4 integration avoids the energy-drift that simple Euler has at
      low frame-rates; a post-step speed cap prevents runaway velocity.
    • Server + client share the same formulas so client-side prediction stays
      in sync with authoritative server state.

    All distance units are Roblox studs, time units are seconds.
    Volleyball diameter ≈ 0.84 studs (≈ 0.21 m × 4 Roblox studs/m scale).
--]]

local PhysicsService = {}

-- ─── Constants ─────────────────────────────────────────────────────────────

-- Gravitational acceleration (studs/s²).
-- Roblox default is 196.2; we pull it down to 80 to keep rallies fast
-- without the ball hanging in the air for too long.
PhysicsService.GRAVITY = Vector3.new(0, -80, 0)

-- Ball geometry
PhysicsService.BALL_RADIUS  = 0.42  -- studs
PhysicsService.BALL_MASS    = 0.27  -- kg (standard volleyball, kept for Magnus)

-- Quadratic air-drag coefficient  F_drag = -C_DRAG × |v| × v
-- Larger value = more resistance at high speed, tighter arc.
PhysicsService.C_DRAG = 0.028

-- Magnus-effect coefficient  F_magnus = C_MAGNUS × (omega × v)
-- Controls how much topspin / backspin curves the trajectory.
PhysicsService.C_MAGNUS = 0.018

-- Coefficient of restitution for floor / wall collisions (0 = dead stop, 1 = perfect bounce)
PhysicsService.BOUNCE_COR = 0.72

-- Fraction of tangential velocity kept after a bounce (simulates friction)
PhysicsService.SURFACE_FRICTION = 0.78

-- Hard cap on ball speed (studs/s) to prevent physics explosions
PhysicsService.MAX_SPEED = 280

-- Minimum speed below which we zero out velocity (sleep threshold)
PhysicsService.SLEEP_THRESHOLD = 0.05

-- ─── RK4 Integrator ────────────────────────────────────────────────────────

-- Returns the derivative (acceleration) at a given velocity and spin.
-- @param velocity  Vector3  current ball velocity (studs/s)
-- @param spin      Vector3  angular velocity (rad/s)  – set to Vector3.zero for no spin
-- @return          Vector3  net acceleration (studs/s²)
local function acceleration(velocity, spin)
    -- Quadratic drag opposes motion, grows with the square of speed
    local speed   = velocity.Magnitude
    local drag    = -PhysicsService.C_DRAG * speed * velocity

    -- Magnus force: spin cross velocity creates a sideways / upward push
    local magnus  = PhysicsService.C_MAGNUS * spin:Cross(velocity)

    return PhysicsService.GRAVITY + drag + magnus
end

--[[
    stepPhysics(position, velocity, spin, dt)
    Advance the ball one time-step using 4th-order Runge-Kutta integration.

    @param position  Vector3   world position (studs)
    @param velocity  Vector3   velocity (studs/s)
    @param spin      Vector3   angular velocity (rad/s)
    @param dt        number    time-step (seconds)
    @return newPosition Vector3, newVelocity Vector3
--]]
function PhysicsService.stepPhysics(position, velocity, spin, dt)
    -- RK4 position/velocity integration
    local k1v = acceleration(velocity,            spin)
    local k1p = velocity

    local k2v = acceleration(velocity + k1v*(dt/2), spin)
    local k2p = velocity + k1v*(dt/2)

    local k3v = acceleration(velocity + k2v*(dt/2), spin)
    local k3p = velocity + k2v*(dt/2)

    local k4v = acceleration(velocity + k3v*dt,   spin)
    local k4p = velocity + k3v*dt

    local newVelocity = velocity  + (k1v + 2*k2v + 2*k3v + k4v) * (dt/6)
    local newPosition = position  + (k1p + 2*k2p + 2*k3p + k4p) * (dt/6)

    -- ── Post-step safety clamps ──────────────────────────────────────────
    local newSpeed = newVelocity.Magnitude
    if newSpeed > PhysicsService.MAX_SPEED then
        -- Preserve direction, clamp magnitude
        newVelocity = newVelocity * (PhysicsService.MAX_SPEED / newSpeed)
    elseif newSpeed < PhysicsService.SLEEP_THRESHOLD then
        newVelocity = Vector3.zero
    end

    return newPosition, newVelocity
end

-- ─── Collision Response ────────────────────────────────────────────────────

--[[
    reflectVelocity(velocity, surfaceNormal)
    Compute the post-collision velocity after hitting a surface.

    Applies:
      • Restitution along the normal   (energy absorbed = 1 – COR)
      • Friction along the tangent     (sliding energy lost)

    @param velocity       Vector3  pre-collision velocity
    @param surfaceNormal  Vector3  unit normal of the hit surface (pointing away)
    @return               Vector3  post-collision velocity
--]]
function PhysicsService.reflectVelocity(velocity, surfaceNormal)
    local n        = surfaceNormal.Unit
    local vNormal  = velocity:Dot(n)

    -- Only respond if moving into the surface
    if vNormal >= 0 then
        return velocity
    end

    local vNVec    = n * vNormal                          -- normal component
    local vTVec    = velocity - vNVec                     -- tangential component

    -- Reverse and dampen the normal component, dampen the tangential component
    return -vNVec * PhysicsService.BOUNCE_COR
         +  vTVec * PhysicsService.SURFACE_FRICTION
end

-- ─── Interpolation / Smoothing Helpers ─────────────────────────────────────

--[[
    springLerp(current, target, velocity, stiffness, damping, dt)
    Critically-damped spring interpolation for smooth position tracking.
    Returns newValue, newVelocity.

    Tuning guide:
      stiffness  higher → snappier (try 160–300)
      damping    2 × sqrt(stiffness) gives critical damping (no overshoot)

    @param current    number   current value
    @param target     number   target value
    @param velocity   number   current spring velocity
    @param stiffness  number   spring constant  (default ~200)
    @param damping    number   damping constant (default ~28)
    @param dt         number   delta-time (seconds)
    @return           number, number  (newValue, newVelocity)
--]]
function PhysicsService.springLerp(current, target, vel, stiffness, damping, dt)
    stiffness = stiffness or 200
    damping   = damping   or 28

    local displacement = current - target
    local accel        = -stiffness * displacement - damping * vel
    local newVel       = vel     + accel * dt
    local newValue     = current + newVel * dt
    return newValue, newVel
end

--[[
    springLerpV3(current, target, springVel, stiffness, damping, dt)
    Vector3 wrapper around springLerp – one spring per axis.
    springVel is a Vector3 that must be stored between frames.
--]]
function PhysicsService.springLerpV3(current, target, springVel, stiffness, damping, dt)
    local nx, svx = PhysicsService.springLerp(current.X, target.X, springVel.X, stiffness, damping, dt)
    local ny, svy = PhysicsService.springLerp(current.Y, target.Y, springVel.Y, stiffness, damping, dt)
    local nz, svz = PhysicsService.springLerp(current.Z, target.Z, springVel.Z, stiffness, damping, dt)
    return Vector3.new(nx, ny, nz), Vector3.new(svx, svy, svz)
end

--[[
    exponentialDecay(current, target, rate, dt)
    Frame-rate independent exponential smoothing.
    rate = 0 (no smoothing) … higher = slower approach.
    Equivalent to:  lerp(current, target,  1 - exp(-rate * dt))
--]]
function PhysicsService.exponentialDecay(current, target, rate, dt)
    local alpha = 1 - math.exp(-rate * dt)
    return current + (target - current) * alpha
end

-- Vector3 variant
function PhysicsService.exponentialDecayV3(current, target, rate, dt)
    local alpha = 1 - math.exp(-rate * dt)
    return current:Lerp(target, alpha)
end

return PhysicsService
