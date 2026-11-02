import * as THREE from 'three';
import { NpcData } from '../problems/validator';
import { CharacterRig } from '../world/models';
import { Vec2 } from '../pathfinding/trail';

export interface NpcRuntimeState {
  npc: NpcData;
  currentWaypointIdx: number;
  pos: Vec2;
  rotY: number;
  waitTimer: number;
  currentAction: 'pc' | 'cafe' | 'celular' | 'alongar' | 'walking' | 'greeting';
  emotion: 'neutral' | 'waiting' | 'satisfied' | 'annoyed';
  emotionTimer: number;
}

export function initNpcRuntimeStates(npcs: NpcData[]): Record<string, NpcRuntimeState> {
  const states: Record<string, NpcRuntimeState> = {};
  npcs.forEach((npc, idx) => {
    const wp = npc.waypoints[0];
    states[npc.id] = {
      npc,
      currentWaypointIdx: 0,
      pos: { x: wp.x, z: wp.z },
      rotY: wp.z > 0 ? Math.PI : 0,
      waitTimer: 3 + (idx % 4) * 1.5,
      currentAction: 'pc',
      emotion: 'neutral',
      emotionTimer: 0,
    };
  });
  return states;
}

/**
 * Updates all 15 NPCs each frame:
 * - NPCs circulate naturally inside their own sector between their room waypoints.
 * - When an NPC's sector has the active support call, they stay near their workstation and wave when the player approaches.
 * - When the player is within 3.5m of any NPC, the NPC turns their head/body toward the player and waves.
 */
export function updateNpcsFrame(
  states: Record<string, NpcRuntimeState>,
  rigs: Record<string, CharacterRig>,
  playerPos: Vec2,
  activeTicketSectorId: string | null,
  dt: number,
  elapsedTime: number
): void {
  for (const id of Object.keys(states)) {
    const st = states[id];
    const rig = rigs[id];
    if (!rig) continue;

    if (st.emotionTimer > 0) {
      st.emotionTimer = Math.max(0, st.emotionTimer - dt);
      if (st.emotionTimer === 0 && st.emotion !== 'waiting') {
        st.emotion = 'neutral';
      }
    }

    const isTicketOwner = activeTicketSectorId === st.npc.setor;
    if (isTicketOwner && st.emotion === 'neutral') {
      st.emotion = 'waiting';
    } else if (!isTicketOwner && st.emotion === 'waiting') {
      st.emotion = 'neutral';
    }

    const distToPlayer = Math.hypot(playerPos.x - st.pos.x, playerPos.z - st.pos.z);

    // If player is nearby, face the player and wave/greet
    if (distToPlayer < 3.4) {
      st.currentAction = 'greeting';
      const targetAngle = Math.atan2(playerPos.x - st.pos.x, playerPos.z - st.pos.z);
      st.rotY = dampAngle(st.rotY, targetAngle, 8, dt);

      // Gentle greeting wave animation on right arm
      rig.rightArm.rotation.x = -Math.PI * 0.65 + Math.sin(elapsedTime * 7) * 0.25;
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, 0, 6, dt);
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 8, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 8, dt);
      rig.headGroup.rotation.y = Math.sin(elapsedTime * 2) * 0.12;
    } else {
      // If this NPC has an active ticket, prefer staying at waypoint 0 (near PC)
      if (isTicketOwner) {
        st.currentWaypointIdx = 0;
      }

      const targetWp = st.npc.waypoints[st.currentWaypointIdx];
      const dx = targetWp.x - st.pos.x;
      const dz = targetWp.z - st.pos.z;
      const distWp = Math.hypot(dx, dz);

      if (distWp > 0.12) {
        st.currentAction = 'walking';
        const speed = 1.35;
        const step = Math.min(distWp, speed * dt);
        st.pos.x += (dx / distWp) * step;
        st.pos.z += (dz / distWp) * step;

        const moveAngle = Math.atan2(dx, dz);
        st.rotY = dampAngle(st.rotY, moveAngle, 8, dt);

        // Walk cycle synced to movement
        const walkPhase = elapsedTime * 6.5;
        rig.leftLeg.rotation.x = Math.sin(walkPhase) * 0.42;
        rig.rightLeg.rotation.x = -Math.sin(walkPhase) * 0.42;
        rig.leftArm.rotation.x = -Math.sin(walkPhase) * 0.32;
        rig.rightArm.rotation.x = Math.sin(walkPhase) * 0.32;
        rig.headGroup.rotation.y = 0;
      } else {
        // Reached waypoint: perform contextual room animation
        st.currentAction = targetWp.acao;
        rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 8, dt);
        rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 8, dt);

        if (targetWp.acao === 'pc') {
          const pcFacing = st.pos.z > 0 ? 0 : Math.PI;
          st.rotY = dampAngle(st.rotY, pcFacing, 6, dt);
          // Typing animation
          rig.leftArm.rotation.x = -0.65 + Math.sin(elapsedTime * 11) * 0.08;
          rig.rightArm.rotation.x = -0.65 + Math.cos(elapsedTime * 11) * 0.08;
          rig.headGroup.rotation.y = Math.sin(elapsedTime * 1.4) * 0.1;
        } else if (targetWp.acao === 'cafe') {
          rig.rightArm.rotation.x = -0.95 + Math.sin(elapsedTime * 2) * 0.18;
          rig.leftArm.rotation.x = 0;
        } else if (targetWp.acao === 'alongar') {
          rig.leftArm.rotation.x = -2.2 + Math.sin(elapsedTime * 3) * 0.2;
          rig.rightArm.rotation.x = -2.2 + Math.sin(elapsedTime * 3) * 0.2;
        } else {
          // celular
          rig.rightArm.rotation.x = -0.8;
          rig.headGroup.rotation.x = 0.2;
        }

        st.waitTimer -= dt;
        if (st.waitTimer <= 0 && !isTicketOwner) {
          st.currentWaypointIdx = (st.currentWaypointIdx + 1) % st.npc.waypoints.length;
          st.waitTimer = 4.5 + Math.random() * 4.5;
        }
      }
    }

    rig.group.position.set(st.pos.x, 0, st.pos.z);
    rig.group.rotation.y = st.rotY;
  }
}

function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  let diff = target - current;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return current + diff * (1 - Math.exp(-lambda * dt));
}
