"use client";

import React, { useEffect, useState } from "react";
import Rive, { useRive, useStateMachineInput } from "@rive-app/react-canvas";

export default function RivePet({ petType, status, hunger, attention, fallbackSvg }) {
  const [useRiveAnimation, setUseRiveAnimation] = useState(false);
  const [rivSrc, setRivSrc] = useState(null);

  // Map petTypes to potential custom Rive asset files in your public folder
  const RIVE_ASSET_PATHS = {
    puppy: "/assets/pets/puppy.riv",
    kitten: "/assets/pets/kitten.riv",
    panda: "/assets/pets/panda.riv",
    bunny: "/assets/pets/bunny.riv",
  };

  useEffect(() => {
    const checkRiveAsset = async () => {
      const src = RIVE_ASSET_PATHS[petType];
      if (!src) return;
      
      try {
        const response = await fetch(src, { method: "HEAD" });
        if (response.ok) {
          setRivSrc(src);
          setUseRiveAnimation(true);
        } else {
          setUseRiveAnimation(false);
        }
      } catch {
        setUseRiveAnimation(false);
      }
    };

    checkRiveAsset();
  }, [petType]);

  // Hook to load and control Rive state machine
  const { rive, RiveComponent } = useRive({
    src: rivSrc,
    stateMachines: "State Machine 1", // Standard Rive state machine name
    autoplay: true,
  });

  // Dynamically update Rive inputs when stats change
  const hungerInput = useStateMachineInput(rive, "State Machine 1", "hunger");
  const attentionInput = useStateMachineInput(rive, "State Machine 1", "attention");
  const sickInput = useStateMachineInput(rive, "State Machine 1", "isSick");
  const runawayInput = useStateMachineInput(rive, "State Machine 1", "isRunaway");

  useEffect(() => {
    if (hungerInput) hungerInput.value = hunger;
  }, [hunger, hungerInput]);

  useEffect(() => {
    if (attentionInput) attentionInput.value = attention;
  }, [attention, attentionInput]);

  useEffect(() => {
    if (sickInput) sickInput.value = (status === "sick");
  }, [status, sickInput]);

  useEffect(() => {
    if (runawayInput) runawayInput.value = (status === "runaway");
  }, [status, runawayInput]);

  if (useRiveAnimation && rivSrc) {
    return (
      <div style={{ width: "200px", height: "200px", position: "relative" }}>
        <RiveComponent style={{ width: "100%", height: "100%" }} />
      </div>
    );
  }

  // Fallback to our premium custom-animated SVGs if .riv file is not provided in public folder
  return (
    <div style={{ position: "relative" }}>
      {fallbackSvg}
    </div>
  );
}
