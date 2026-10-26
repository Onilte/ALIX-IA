-----// Target — Blobman Systems \\------
do
    local box = Tabs.Target:AddSection({ Name = "Blobman Systems", Side = "Left" })

    local State = {
        LoopKill = false,
        LoopKick = false,
        GrabBlob = false,
        BlitzKick = false,
        SpamKick = false,
        Orbit = false,
        KillAll = false,
        KickAll = false,
    }
    local Threads = {}
    local Targets = { Blobman = nil }
    local OrbitRadius, OrbitSpeed = 12, 2
    local KillAllWL, KickAllWL = true, true

    local function getBlob()
        local c = plr.Character
        local h = c and c:FindFirstChild("Humanoid")
        if h and h.SeatPart and h.SeatPart.Parent and h.SeatPart.Parent.Name == "CreatureBlobman" then
            return h.SeatPart.Parent
        end
    end

    local function ensureBlob()
        local b = getBlob() or (inv and inv:FindFirstChild("CreatureBlobman"))
        if b then return b end
        if not plr.CanSpawnToy.Value then
            local t0 = tick()
            repeat task.wait() until plr.CanSpawnToy.Value or tick() - t0 > 5
        end
        pcall(function()
            SpawnToy:InvokeServer("CreatureBlobman", HRP.CFrame * CFrame.new(5, 5, 20), Vector3.zero)
        end)
        local t0 = tick()
        repeat
            task.wait()
            b = inv and inv:FindFirstChild("CreatureBlobman")
        until b or tick() - t0 > 3
        return b
    end

    local function listPlayers()
        local l = {"None"}
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= plr then table.insert(l, p.DisplayName .. " (" .. p.Name .. ")") end
        end
        return l
    end

    local function getT()
        if not Targets.Blobman then return nil end
        local p = Players:FindFirstChild(Targets.Blobman)
        if p and p.Character and p.Character:FindFirstChild("HumanoidRootPart") then return p end
    end

    local function shouldSkip(p, wl)
        if wl then
            local ok, fr = pcall(function() return plr:IsFriendsWith(p.UserId) end)
            if ok and fr then return true end
        end
        return false
    end

    -----// target dropdown \\------
    local TargetDrop
    TargetDrop = box:AddDropdown({
        Name = "Target (Blobman Systems)",
        Options = listPlayers(),
        Default = 1,
        Flag = "BlobSys_Target",
        Callback = function(v)
            Targets.Blobman = getname(v)
        end
    })

    box:AddButton({
        Name = "Refresh Target List",
        Callback = function()
            if TargetDrop and TargetDrop.Refresh then
                TargetDrop:Refresh(listPlayers(), true)
            end
        end
    })

    Players.PlayerAdded:Connect(function()
        task.wait(0.5)
        if TargetDrop and TargetDrop.Refresh then TargetDrop:Refresh(listPlayers(), true) end
    end)
    Players.PlayerRemoving:Connect(function()
        task.wait(0.5)
        if TargetDrop and TargetDrop.Refresh then TargetDrop:Refresh(listPlayers(), true) end
    end)

    box:AddDivider()

    -----// 1. Loop Kill \\------
    box:AddToggle({
        Name = "Loop Kill (Blobman)",
        Default = false,
        Flag = "BlobSys_LoopKill",
        Callback = function(v)
            State.LoopKill = v
            if not v then
                if Threads.LoopKill then pcall(task.cancel, Threads.LoopKill) Threads.LoopKill = nil end
                return
            end
            Threads.LoopKill = task.spawn(function()
                while State.LoopKill do
                    local t = getT()
                    if not t then task.wait(0.3) continue end
                    local th = t.Character:FindFirstChild("Humanoid")
                    local tr = t.Character:FindFirstChild("HumanoidRootPart")
                    if not th or not tr or th.Health <= 0 then task.wait(0.2) continue end
                    local b = getBlob() or ensureBlob()
                    if not b then task.wait(0.3) continue end
                    local bs = b:FindFirstChild("BlobmanSeatAndOwnerScript")
                    if not bs then task.wait(0.3) continue end
                    local CG = bs:FindFirstChild("CreatureGrab")
                    local CD = bs:FindFirstChild("CreatureDrop")
                    local RD = b:FindFirstChild("RightDetector")
                    if not (CG and CD and RD) then task.wait(0.3) continue end
                    if (tr.Position - HRP.Position).Magnitude > 30 then
                        local pos = HRP.CFrame
                        HRP.CFrame = tr.CFrame
                        local t0 = tick()
                        repeat task.wait()
                            pcall(function() CG:FireServer(RD, tr, RD.RightWeld) end)
                            pcall(function() CD:FireServer(RD.RightWeld) end)
                        until isnetworkowner(tr) or not State.LoopKill or tick() - t0 > 3
                        HRP.CFrame = pos
                    end
                    if isnetworkowner(tr) then
                        th:ChangeState(Enum.HumanoidStateType.Dead)
                        pcall(function() DestroyLine:FireServer(tr) end)
                    end
                    task.wait(0.05)
                end
            end)
        end
    })

    -----// 2. Loop Kick \\------
    box:AddToggle({
        Name = "Loop Kick (Blobman)",
        Default = false,
        Flag = "BlobSys_LoopKick",
        Callback = function(v)
            State.LoopKick = v
            if not v then
                if Threads.LoopKick then pcall(task.cancel, Threads.LoopKick) Threads.LoopKick = nil end
                return
            end
            Threads.LoopKick = task.spawn(function()
                while State.LoopKick do
                    local t = getT()
                    if not t then task.wait(0.3) continue end
                    local th = t.Character:FindFirstChild("Humanoid")
                    local tr = t.Character:FindFirstChild("HumanoidRootPart")
                    if not th or not tr or th.Health <= 0 then task.wait(0.2) continue end
                    local b = getBlob()
                    if not b then task.wait(0.3) continue end
                    local bs = b:FindFirstChild("BlobmanSeatAndOwnerScript")
                    if not bs then task.wait(0.3) continue end
                    local CG = bs:FindFirstChild("CreatureGrab")
                    local CD = bs:FindFirstChild("CreatureDrop")
                    local RD = b:FindFirstChild("RightDetector")
                    if not (CG and CD and RD) then task.wait(0.3) continue end
                    if (tr.Position - HRP.Position).Magnitude > 30 then
                        local pos = HRP.CFrame
                        HRP.CFrame = tr.CFrame
                        local t0 = tick()
                        repeat task.wait()
                            pcall(function() CG:FireServer(RD, tr, RD.RightWeld) end)
                            pcall(function() CD:FireServer(RD.RightWeld) end)
                        until isnetworkowner(tr) or not State.LoopKick or tick() - t0 > 3
                        HRP.CFrame = pos
                    end
                    if isnetworkowner(tr) then
                        tr.AssemblyLinearVelocity = Vector3.new(0, 1e10, 0)
                        pcall(function() DestroyLine:FireServer(tr) end)
                        pcall(function() CG:FireServer(RD, tr, RD.RightWeld) end)
                    end
                    task.wait(0.05)
                end
            end)
        end
    })

    -----// 3. Grab & Blob Loop Kick \\------
    box:AddToggle({
        Name = "Grab & Blob Loop Kick",
        Default = false,
        Flag = "BlobSys_GrabBlob",
        Callback = function(v)
            State.GrabBlob = v
            if not v then
                if Threads.GrabBlob then pcall(task.cancel, Threads.GrabBlob) Threads.GrabBlob = nil end
                return
            end
            Threads.GrabBlob = task.spawn(function()
                local savedPos = HRP.CFrame
                while State.GrabBlob do
                    local t = getT()
                    if not t then task.wait(0.3) continue end
                    local tr = t.Character:FindFirstChild("HumanoidRootPart")
                    local th = t.Character:FindFirstChild("Humanoid")
                    if not tr or not th or th.Health <= 0 then task.wait(0.2) continue end
                    local b = getBlob()
                    if not b then task.wait(0.3) continue end
                    local bs = b:FindFirstChild("BlobmanSeatAndOwnerScript")
                    if not bs then task.wait(0.3) continue end
                    local CG = bs:FindFirstChild("CreatureGrab")
                    local CD = bs:FindFirstChild("CreatureDrop")
                    local LD = b:FindFirstChild("LeftDetector")
                    local RD = b:FindFirstChild("RightDetector")
                    if not (CG and CD and LD and RD) then task.wait(0.3) continue end
                    pcall(function()
                        CG:FireServer(LD, tr, LD.LeftWeld)
                        CG:FireServer(RD, tr, RD.RightWeld)
                        CD:FireServer(LD.LeftWeld, tr)
                        CD:FireServer(RD.RightWeld, tr)
                    end)
                    if (tr.Position - HRP.Position).Magnitude > 30 then
                        HRP.CFrame = tr.CFrame
                        task.wait(0.1)
                        sno(tr)
                        HRP.CFrame = savedPos
                    end
                    local lockPos = savedPos * CFrame.new(0, 25, 0)
                    pcall(function()
                        tr.AssemblyLinearVelocity = Vector3.zero
                        tr.AssemblyAngularVelocity = Vector3.zero
                        tr.CFrame = lockPos
                        th.PlatformStand = true
                        SetNetOwner:FireServer(tr, lockPos)
                        DestroyLine:FireServer(tr)
                        CG:FireServer(RD, tr, RD.RightWeld)
                    end)
                    task.wait(0.05)
                end
            end)
        end
    })

    -----// 4. Blitz Blobman Kick \\------
    box:AddToggle({
        Name = "Blitz Blobman Kick",
        Default = false,
        Flag = "BlobSys_Blitz",
        Callback = function(v)
            State.BlitzKick = v
            if not v then
                if Threads.Blitz then pcall(task.cancel, Threads.Blitz) Threads.Blitz = nil end
                return
            end
            Threads.Blitz = task.spawn(function()
                while State.BlitzKick do
                    local t = getT()
                    if not t then task.wait(0.4) continue end
                    local tr = t.Character:FindFirstChild("HumanoidRootPart")
                    local th = t.Character:FindFirstChild("Humanoid")
                    if not tr or not th or th.Health <= 0 then task.wait(0.3) continue end
                    local b = getBlob()
                    if not b then task.wait(0.4) continue end
                    local bs = b:FindFirstChild("BlobmanSeatAndOwnerScript")
                    if not bs then task.wait(0.3) continue end
                    local CG = bs:FindFirstChild("CreatureGrab")
                    local CD = bs:FindFirstChild("CreatureDrop")
                    local LD = b:FindFirstChild("LeftDetector")
                    local RD = b:FindFirstChild("RightDetector")
                    if not (CG and CD and LD and RD) then task.wait(0.3) continue end
                    pcall(function()
                        CG:FireServer(LD, tr, LD.LeftWeld)
                        CG:FireServer(RD, tr, RD.RightWeld)
                        task.wait(0.05)
                        CD:FireServer(LD.LeftWeld, tr)
                        CD:FireServer(RD.RightWeld, tr)
                    end)
                    local savedPos = HRP.CFrame
                    HRP.CFrame = tr.CFrame
                    task.wait(0.1)
                    sno(tr)
                    task.wait(0.05)
                    HRP.CFrame = savedPos * CFrame.new(0, 15, 0)
                    task.wait(0.3)
                end
            end)
        end
    })

    -----// 5. Quick Kick (one-shot) \\------
    box:AddButton({
        Name = "Quick Kick (one-shot)",
        Callback = function()
            local t = getT()
            if not t then
                OrionLib:MakeNotification({Name = "Blobman", Content = "selecione um target primeiro", Time = 4, Image = "alert-circle"})
                return
            end
            local b = getBlob()
            if not b then
                OrionLib:MakeNotification({Name = "Blobman", Content = "você precisa estar montado num Blobman", Time = 4, Image = "alert-circle"})
                return
            end
            task.spawn(function()
                local tr = t.Character and t.Character:FindFirstChild("HumanoidRootPart")
                if not tr then return end
                local bs = b:FindFirstChild("BlobmanSeatAndOwnerScript")
                if not bs then return end
                local CG = bs:FindFirstChild("CreatureGrab")
                local CD = bs:FindFirstChild("CreatureDrop")
                local RD = b:FindFirstChild("RightDetector")
                local LD = b:FindFirstChild("LeftDetector")
                if not (CG and CD and RD and LD) then return end
                local savedPos = HRP.CFrame
                pcall(function()
                    CG:FireServer(LD, tr, LD.LeftWeld)
                    CG:FireServer(RD, tr, RD.RightWeld)
                    CD:FireServer(LD.LeftWeld, tr)
                    CD:FireServer(RD.RightWeld, tr)
                    tr.AssemblyLinearVelocity = Vector3.new(0, 1e10, 0)
                    DestroyLine:FireServer(tr)
                end)
                HRP.CFrame = tr.CFrame
                task.wait(0.15)
                sno(tr)
                HRP.CFrame = savedPos
            end)
        end
    })

    -----// 6. Spam Kick (NETOWN) \\------
    box:AddToggle({
        Name = "Spam Kick (NETOWN)",
        Default = false,
        Flag = "BlobSys_SpamKick",
        Callback = function(v)
            State.SpamKick = v
            if not v then
                if Threads.SpamKick then pcall(task.cancel, Threads.SpamKick) Threads.SpamKick = nil end
                return
            end
            Threads.SpamKick = task.spawn(function()
                while State.SpamKick do
                    local t = getT()
                    if not t then task.wait(0.3) continue end
                    local tr = t.Character:FindFirstChild("HumanoidRootPart")
                    local th = t.Character:FindFirstChild("Humanoid")
                    if not tr or not th or th.Health <= 0 then task.wait(0.2) continue end
                    local b = getBlob()
                    if not b then task.wait(0.3) continue end
                    local bs = b:FindFirstChild("BlobmanSeatAndOwnerScript")
                    if not bs then task.wait(0.3) continue end
                    local CG = bs:FindFirstChild("CreatureGrab")
                    local CR = bs:FindFirstChild("CreatureRelease")
                    local RD = b:FindFirstChild("RightDetector")
                    if not (CG and CR and RD) then task.wait(0.3) continue end
                    pcall(function()
                        SetNetOwner:FireServer(tr, tr.CFrame)
                        DestroyLine:FireServer(tr)
                        CG:FireServer(RD, tr, RD.RightWeld)
                        task.wait(0.02)
                        CR:FireServer(RD.RightWeld, tr)
                    end)
                    task.wait(0.08)
                end
            end)
        end
    })

    -----// 7. Blobman Orbit \\------
    box:AddSlider({
        Name = "Orbit Radius",
        Min = 5, Max = 35, Default = 12,
        Increment = 1, ValueName = "studs",
        Flag = "BlobSys_OrbitRadius",
        Callback = function(v) OrbitRadius = v end
    })
    box:AddSlider({
        Name = "Orbit Speed",
        Min = 1, Max = 40, Default = 2,
        Increment = 1, ValueName = "spd",
        Flag = "BlobSys_OrbitSpeed",
        Callback = function(v) OrbitSpeed = v end
    })

    local OrbitConns = {}
    local function StopOrbit()
        for _, c in ipairs(OrbitConns) do pcall(function() c:Disconnect() end) end
        OrbitConns = {}
        local t = getT()
        if t and t.Character then
            local tr = t.Character:FindFirstChild("HumanoidRootPart")
            if tr and tr:FindFirstChild("OrbitBodyPos") then tr.OrbitBodyPos:Destroy() end
        end
    end

    box:AddToggle({
        Name = "Blobman Orbit",
        Default = false,
        Flag = "BlobSys_Orbit",
        Callback = function(v)
            State.Orbit = v
            StopOrbit()
            if not v then return end
            local t = getT()
            if not t then
                OrionLib:MakeNotification({Name = "Blobman", Content = "selecione um target primeiro", Time = 4, Image = "alert-circle"})
                if OrionLib.Flags.BlobSys_Orbit then OrionLib.Flags.BlobSys_Orbit:Set(false) end
                return
            end
            local b = getBlob()
            if not b then
                OrionLib:MakeNotification({Name = "Blobman", Content = "você precisa estar montado num Blobman", Time = 4, Image = "alert-circle"})
                if OrionLib.Flags.BlobSys_Orbit then OrionLib.Flags.BlobSys_Orbit:Set(false) end
                return
            end
            local tr = t.Character:FindFirstChild("HumanoidRootPart")
            if not tr then
                if OrionLib.Flags.BlobSys_Orbit then OrionLib.Flags.BlobSys_Orbit:Set(false) end
                return
            end
            if tr:FindFirstChild("OrbitBodyPos") then tr.OrbitBodyPos:Destroy() end
            local bp = Instance.new("BodyPosition")
            bp.Name = "OrbitBodyPos"
            bp.MaxForce = Vector3.new(math.huge, math.huge, math.huge)
            bp.Position = tr.Position + Vector3.new(0, 20, 0)
            bp.P = 5000
            bp.D = 100
            bp.Parent = tr

            local rot = 0
            table.insert(OrbitConns, RunService.Heartbeat:Connect(function()
                if not State.Orbit then return end
                local b2 = getBlob(); if not b2 then return end
                local br = b2:FindFirstChild("HumanoidRootPart") or b2.PrimaryPart; if not br then return end
                local t2 = getT(); if not t2 then return end
                local tr2 = t2.Character and t2.Character:FindFirstChild("HumanoidRootPart"); if not tr2 then return end
                local bp2 = tr2:FindFirstChild("OrbitBodyPos"); if not bp2 then return end
                rot += OrbitSpeed
                br.CFrame = CFrame.new(bp2.Position) * CFrame.Angles(0, math.rad(rot), 0) * CFrame.new(OrbitRadius, 0, 0)
                br.AssemblyLinearVelocity = Vector3.zero
            end))
            table.insert(OrbitConns, RunService.RenderStepped:Connect(function()
                if not State.Orbit then return end
                local b2 = getBlob(); if not b2 then return end
                local br = b2:FindFirstChild("HumanoidRootPart") or b2.PrimaryPart; if not br then return end
                local t2 = getT(); if not t2 then return end
                local tr2 = t2.Character and t2.Character:FindFirstChild("HumanoidRootPart"); if not tr2 then return end
                local bp2 = tr2:FindFirstChild("OrbitBodyPos"); if not bp2 then return end
                br.CFrame = CFrame.new(br.Position, bp2.Position)
            end))
            task.spawn(function()
                while State.Orbit do
                    local t2 = getT(); if not t2 then break end
                    local b2 = getBlob(); if not b2 then break end
                    local bs = b2:FindFirstChild("BlobmanSeatAndOwnerScript"); if not bs then break end
                    local tr2 = t2.Character and t2.Character:FindFirstChild("HumanoidRootPart")
                    local th2 = t2.Character and t2.Character:FindFirstChild("Humanoid")
                    if tr2 and th2 and th2.Health > 0 then
                        local CG = bs:FindFirstChild("CreatureGrab")
                        local CD = bs:FindFirstChild("CreatureDrop")
                        local LD = b2:FindFirstChild("LeftDetector")
                        local RD = b2:FindFirstChild("RightDetector")
                        if CG and CD and LD and RD then
                            for i = 1, 8 do
                                pcall(function()
                                    CG:FireServer(LD, tr2, LD.LeftWeld)
                                    CG:FireServer(RD, tr2, RD.RightWeld)
                                    task.wait(0.001)
                                    CD:FireServer(LD.LeftWeld, tr2)
                                    CD:FireServer(RD.RightWeld, tr2)
                                end)
                            end
                        end
                    end
                    task.wait(0.01)
                end
            end)
        end
    })

    -----// 8. Kill All / Kick All \\------
    box:AddToggle({
        Name = "Whitelist Friends (Kill All)",
        Default = true,
        Flag = "BlobSys_KillAllWL",
        Callback = function(v) KillAllWL = v end
    })
    box:AddToggle({
        Name = "Whitelist Friends (Kick All)",
        Default = true,
        Flag = "BlobSys_KickAllWL",
        Callback = function(v) KickAllWL = v end
    })

    box:AddToggle({
        Name = "Blobman Kill All",
        Default = false,
        Flag = "BlobSys_KillAll",
        Callback = function(v)
            State.KillAll = v
            if not v then
                if Threads.KillAll then pcall(task.cancel, Threads.KillAll) Threads.KillAll = nil end
                return
            end
            Threads.KillAll = task.spawn(function()
                while State.KillAll do
                    local b = getBlob()
                    if not b then task.wait(0.4) continue end
                    local bs = b:FindFirstChild("BlobmanSeatAndOwnerScript")
                    if not bs then task.wait(0.4) continue end
                    local CG = bs:FindFirstChild("CreatureGrab")
                    local CR = bs:FindFirstChild("CreatureRelease")
                    local RD = b:FindFirstChild("RightDetector")
                    if not (CG and CR and RD) then task.wait(0.4) continue end
                    for _, p in ipairs(Players:GetPlayers()) do
                        if not State.KillAll then break end
                        if p ~= plr and p.Character and not shouldSkip(p, KillAllWL) then
                            local tr = p.Character:FindFirstChild("HumanoidRootPart")
                            local th = p.Character:FindFirstChild("Humanoid")
                            if tr and th and th.Health > 0 then
                                pcall(function()
                                    b.HumanoidRootPart.CFrame = tr.CFrame
                                    task.wait(0.1)
                                    local t0 = tick()
                                    repeat task.wait()
                                        CG:FireServer(RD, tr, RD.RightWeld)
                                        CR:FireServer(RD.RightWeld)
                                    until isnetworkowner(tr) or tick() - t0 > 1.5
                                    th:ChangeState(Enum.HumanoidStateType.Dead)
                                end)
                            end
                        end
                    end
                    task.wait(0.5)
                end
            end)
        end
    })

    box:AddToggle({
        Name = "Blobman Kick All",
        Default = false,
        Flag = "BlobSys_KickAll",
        Callback = function(v)
            State.KickAll = v
            if not v then
                if Threads.KickAll then pcall(task.cancel, Threads.KickAll) Threads.KickAll = nil end
                return
            end
            Threads.KickAll = task.spawn(function()
                while State.KickAll do
                    local b = getBlob()
                    if not b then task.wait(0.4) continue end
                    local bs = b:FindFirstChild("BlobmanSeatAndOwnerScript")
                    if not bs then task.wait(0.4) continue end
                    local CG = bs:FindFirstChild("CreatureGrab")
                    local CD = bs:FindFirstChild("CreatureDrop")
                    local RD = b:FindFirstChild("RightDetector")
                    if not (CG and CD and RD) then task.wait(0.4) continue end
                    for _, p in ipairs(Players:GetPlayers()) do
                        if not State.KickAll then break end
                        if p ~= plr and p.Character and not shouldSkip(p, KickAllWL) then
                            local tr = p.Character:FindFirstChild("HumanoidRootPart")
                            local th = p.Character:FindFirstChild("Humanoid")
                            if tr and th and th.Health > 0 then
                                pcall(function()
                                    SetNetOwner:FireServer(tr, tr.CFrame)
                                    DestroyLine:FireServer(tr)
                                    CG:FireServer(RD, tr, RD.RightWeld)
                                    task.wait(0.02)
                                    CD:FireServer(RD.RightWeld, tr)
                                    tr.AssemblyLinearVelocity = Vector3.new(0, 1e10, 0)
                                end)
                            end
                        end
                    end
                    task.wait(0.4)
                end
            end)
        end
    })

    -----// Stop All \\------
    box:AddDivider()
    box:AddButton({
        Name = "Stop All (Blobman Systems)",
        Callback = function()
            State.LoopKill = false
            State.LoopKick = false
            State.GrabBlob = false
            State.BlitzKick = false
            State.SpamKick = false
            State.Orbit = false
            State.KillAll = false
            State.KickAll = false
            for _, key in ipairs({"LoopKill","LoopKick","GrabBlob","Blitz","SpamKick","KillAll","KickAll"}) do
                if Threads[key] then pcall(task.cancel, Threads[key]) Threads[key] = nil end
            end
            StopOrbit()
            for _, flag in ipairs({"BlobSys_LoopKill","BlobSys_LoopKick","BlobSys_GrabBlob","BlobSys_Blitz","BlobSys_SpamKick","BlobSys_Orbit","BlobSys_KillAll","BlobSys_KickAll"}) do
                if OrionLib.Flags[flag] then pcall(function() OrionLib.Flags[flag]:Set(false) end) end
            end
            OrionLib:MakeNotification({Name = "Blobman Systems", Content = "tudo desativado", Time = 3, Image = "stop-circle"})
        end
    })
end