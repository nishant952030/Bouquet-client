import { db } from "../../../../api/_lib/firebase-server";

// Dynamic Next.js Route Handler for Pet Gift actions
export async function GET(request, { params }) {
  const { action } = await params;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (action !== "get") {
    return new Response(JSON.stringify({ error: `Method GET not allowed for action '${action}'` }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing pet ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    if (!db) {
      return new Response(JSON.stringify({ error: "Database not configured on server" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const docRef = db.collection("pets").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return new Response(JSON.stringify({ error: "Pet not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const pet = docSnap.data();
    const updatedPet = calculatePetStats(pet);

    // If status changed to 'runaway' or 'sick', update in Firestore
    if (updatedPet.status !== pet.status) {
      const updateData = { status: updatedPet.status };
      if (updatedPet.status === "runaway") {
        updateData.runawayAt = new Date().toISOString();
      }
      await docRef.update(updateData);
    }

    return new Response(JSON.stringify({ success: true, pet: updatedPet }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching pet details:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request, { params }) {
  const { action } = await params;

  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    // ignore empty body
  }

  try {
    if (!db) {
      return new Response(JSON.stringify({ error: "Database not configured on server" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      const { senderName, receiverName, petType, petName, message, isTestMode, paymentStatus } = body;

      if (!senderName || !receiverName || !petType || !petName) {
        return new Response(JSON.stringify({ error: "Missing required adoption fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const id = "pet_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const newPet = {
        id,
        senderName: senderName.trim(),
        receiverName: receiverName.trim(),
        petType,
        petName: petName.trim(),
        message: (message || "").trim(),
        isTestMode: !!isTestMode,
        status: "active",
        lastFedAt: new Date().toISOString(),
        lastInteractedAt: new Date().toISOString(),
        healedCount: 0,
        paymentStatus: paymentStatus || "free",
        createdAt: new Date().toISOString(),
      };

      await db.collection("pets").doc(id).set(newPet);
      return new Response(JSON.stringify({ success: true, id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "action") {
      const { id, actionType, userUid } = body;

      if (!id || !actionType || !userUid) {
        return new Response(JSON.stringify({ error: "Missing required interaction parameters" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const docRef = db.collection("pets").doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return new Response(JSON.stringify({ error: "Pet not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const pet = docSnap.data();
      const currentCalculated = calculatePetStats(pet);

      if (currentCalculated.status === "runaway") {
        return new Response(JSON.stringify({ error: "This pet has already run away back to the sender's yard! Ask them to nurse it back to health." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Claim logic: First Google Auth user to interact becomes the receiverUid owner
      const updateData = {};
      if (!pet.receiverUid) {
        updateData.receiverUid = userUid;
        pet.receiverUid = userUid;
      } else if (pet.receiverUid !== userUid) {
        return new Response(JSON.stringify({ error: "Only the designated recipient can care for this pet." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      const nowStr = new Date().toISOString();
      if (actionType === "feed") {
        updateData.lastFedAt = nowStr;
        updateData.status = "active";
      } else if (["play", "pet", "talk"].includes(actionType)) {
        updateData.lastInteractedAt = nowStr;
        updateData.status = "active";
      } else {
        return new Response(JSON.stringify({ error: `Invalid action type '${actionType}'` }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await docRef.update(updateData);
      
      const mergedPetObj = { ...pet, ...updateData };
      const recalculated = calculatePetStats(mergedPetObj);

      return new Response(JSON.stringify({ success: true, pet: recalculated }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "heal") {
      const { id } = body;

      if (!id) {
        return new Response(JSON.stringify({ error: "Missing pet ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const docRef = db.collection("pets").doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return new Response(JSON.stringify({ error: "Pet not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const pet = docSnap.data();
      const currentCalculated = calculatePetStats(pet);

      if (currentCalculated.status !== "runaway") {
        return new Response(JSON.stringify({ error: "This pet is already healthy and has not run away." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const nowStr = new Date().toISOString();
      const updateData = {
        status: "active",
        lastFedAt: nowStr,
        lastInteractedAt: nowStr,
        healedCount: (pet.healedCount || 0) + 1,
      };

      await docRef.update(updateData);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Action '${action}' not supported` }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error handling pet request:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Logic to calculate dynamic decay and state transitions
function calculatePetStats(pet) {
  const isTestMode = !!pet.isTestMode;
  
  // Decay constants
  const DECAY_DURATION_MS = isTestMode ? 10 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const SICKNESS_THRESHOLD_MS = isTestMode ? 5 * 60 * 1000 : 12 * 60 * 60 * 1000;
  const RUNAWAY_THRESHOLD_MS = isTestMode ? 5 * 60 * 1000 : 12 * 60 * 60 * 1000;

  const now = Date.now();
  const fedTime = new Date(pet.lastFedAt).getTime();
  const interactTime = new Date(pet.lastInteractedAt).getTime();

  const elapsedFed = now - fedTime;
  const elapsedInteract = now - interactTime;

  // Calculate stats linear decay
  const hunger = Math.max(0, Math.round(100 - (elapsedFed / DECAY_DURATION_MS) * 100));
  const attention = Math.max(0, Math.round(100 - (elapsedInteract / DECAY_DURATION_MS) * 100));

  let status = pet.status;

  if (pet.status !== "runaway") {
    // Calculate when stats hit 0
    const zeroHungerTime = fedTime + DECAY_DURATION_MS;
    const zeroAttentionTime = interactTime + DECAY_DURATION_MS;
    const neglectStartTime = Math.min(zeroHungerTime, zeroAttentionTime);

    if (now > neglectStartTime) {
      if (now > neglectStartTime + SICKNESS_THRESHOLD_MS + RUNAWAY_THRESHOLD_MS) {
        status = "runaway";
      } else if (now > neglectStartTime + SICKNESS_THRESHOLD_MS) {
        status = "sick";
      } else {
        status = "active";
      }
    } else {
      status = "active";
    }
  }

  return {
    ...pet,
    hunger,
    attention,
    status,
  };
}
