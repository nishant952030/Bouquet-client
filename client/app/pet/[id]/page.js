"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../../../src/lib/firebase";
import LanguageSwitcher from "../../../src/components/LanguageSwitcher";
import RivePet from "../../../src/components/RivePet";

// Pet SVGs and Visual Helpers
const PET_VISUALS = {
  puppy: (status, hunger, attention, mousePos) => {
    const isSick = status === "sick";
    const isLow = hunger <= 30 || attention <= 30;
    const isVerySick = hunger <= 9 || attention <= 9;
    
    // Breathing state
    const breatheClass = isSick || isLow ? "body-breathe-weak" : "body-breathe-stable";
    const shiverClass = isVerySick ? "body-shiver" : "";

    // Eye expression
    let eyeContent = (
      <>
        {/* Left Eye */}
        <circle cx="80" cy="78" r="7" fill="#1e293b" className="eye-blink" />
        <circle cx="78" cy="75" r="2.5" fill="#fff" className="eye-blink" />
        {/* Right Eye */}
        <circle cx="120" cy="78" r="7" fill="#1e293b" className="eye-blink" />
        <circle cx="118" cy="75" r="2.5" fill="#fff" className="eye-blink" />
      </>
    );

    if (isSick) {
      eyeContent = (
        <g stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none">
          {/* Left Eye X */}
          <path d="M 75 73 L 85 83" /><path d="M 85 73 L 75 83" />
          {/* Right Eye X */}
          <path d="M 115 73 L 125 83" /><path d="M 125 73 L 115 83" />
        </g>
      );
    } else if (isVerySick) {
      eyeContent = (
        <g stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none">
          {/* Horizontal slits */}
          <path d="M 73 78 L 87 78" />
          <path d="M 113 78 L 127 78" />
        </g>
      );
    } else if (isLow) {
      // Sad / Drooping eyelids
      eyeContent = (
        <>
          <path d="M 73 82 Q 80 73 87 82" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          <path d="M 113 82 Q 120 73 127 82" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    }

    // Mouth expression
    let mouthContent = <path d="M 96 98 Q 100 102 104 98" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />;
    let tongueClass = "hidden";

    if (isSick || isVerySick) {
      // Miserable downturned mouth
      mouthContent = <path d="M 94 103 Q 100 97 106 103" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />;
    } else if (isLow) {
      // Drooping tongue for hunger / sadness
      mouthContent = <path d="M 94 99 Q 100 103 106 99" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />;
      tongueClass = "tongue-pant-slow";
    } else {
      // Happy panting tongue
      tongueClass = "tongue-pant";
    }

    // Ear drooping
    const earClass = isSick || isLow ? "ears-droop" : "ears-perky";

    // Mouse Tracking Parallax values
    const mx = mousePos?.x || 0;
    const my = mousePos?.y || 0;

    return (
      <svg className={`pet-graphic ${shiverClass}`} viewBox="0 0 200 200" width="160" height="160">
        <defs>
          <radialGradient id="dog-body" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </radialGradient>
          <radialGradient id="dog-ears" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </radialGradient>
        </defs>
        {/* Tail (Wagging) */}
        <path d="M 140 130 C 160 110, 180 120, 175 100 C 170 80, 150 95, 135 115" fill="none" stroke="#854d0e" strokeWidth="12" strokeLinecap="round" className="tail-wag" />
        
        {/* Body (Breathing) */}
        <ellipse cx="100" cy="135" rx="55" ry="45" fill="url(#dog-body)" className={breatheClass} />
        <ellipse cx="100" cy="140" rx="35" ry="25" fill="#fef08a" className={breatheClass} />

        {/* Feet */}
        <circle cx="65" cy="175" r="14" fill="#854d0e" />
        <circle cx="135" cy="175" r="14" fill="#854d0e" />

        {/* Head Group with Mouse Tracking */}
        <g style={{ transform: `translate(${mx * 8}px, ${my * 6}px)`, transformOrigin: "100px 85px", transition: "transform 0.08s ease-out" }}>
          
          {/* Ears */}
          <g className={earClass} style={{ transform: `translate(${mx * -2}px, ${my * -1}px)` }}>
            <path d="M 35 60 C 15 60, 20 120, 45 110 C 55 100, 50 70, 45 65" fill="url(#dog-ears)" />
            <path d="M 165 60 C 185 60, 180 120, 155 110 C 145 100, 150 70, 155 65" fill="url(#dog-ears)" />
          </g>

          {/* Head Base */}
          <circle cx="100" cy="85" r="48" fill="url(#dog-body)" className="head-bob" />

          {/* Eyes Group with Additional Parallax */}
          <g style={{ transform: `translate(${mx * 5}px, ${my * 3}px)`, transformOrigin: "100px 78px", transition: "transform 0.08s ease-out" }}>
            {eyeContent}
            {/* Sad/Sick Eyebrows */}
            {(isSick || isLow) && (
              <g stroke="#854d0e" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M 72 67 Q 80 72 88 68" />
                <path d="M 128 67 Q 120 72 112 68" />
              </g>
            )}
          </g>

          {/* Snout, Nose & Mouth with Parallax */}
          <g style={{ transform: `translate(${mx * 3}px, ${my * 2}px)`, transformOrigin: "100px 94px", transition: "transform 0.08s ease-out" }}>
            <ellipse cx="100" cy="94" rx="16" ry="11" fill="#fef08a" />
            <polygon points="94,90 106,90 100,96" fill="#1e293b" />
            {mouthContent}
            {/* Tongue */}
            <path d="M 97 101 C 97 110, 103 110, 103 101 Z" fill="#ec4899" className={tongueClass} />
          </g>

        </g>
      </svg>
    );
  },
  kitten: (status, hunger, attention, mousePos) => {
    const isSick = status === "sick";
    const isLow = hunger <= 30 || attention <= 30;
    const isVerySick = hunger <= 9 || attention <= 9;
    
    // Breathing state
    const breatheClass = isSick || isLow ? "body-breathe-weak" : "body-breathe-stable";
    const shiverClass = isVerySick ? "body-shiver" : "";

    // Eye expression
    let eyeContent = (
      <>
        <circle cx="82" cy="78" r="6" fill="#1e293b" className="eye-blink" />
        <circle cx="80" cy="76" r="2" fill="#fff" className="eye-blink" />
        <circle cx="118" cy="78" r="6" fill="#1e293b" className="eye-blink" />
        <circle cx="116" cy="76" r="2" fill="#fff" className="eye-blink" />
      </>
    );

    if (isSick) {
      eyeContent = (
        <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 77 75 L 87 81" /><path d="M 87 75 L 77 81" />
          <path d="M 113 75 L 123 81" /><path d="M 123 75 L 113 81" />
        </g>
      );
    } else if (isVerySick) {
      eyeContent = (
        <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 76 78 L 88 78" />
          <path d="M 112 78 L 124 78" />
        </g>
      );
    } else if (isLow) {
      eyeContent = (
        <>
          <path d="M 76 81 Q 82 74 88 81" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 112 81 Q 118 74 124 81" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    }

    // Mouth and Whiskers expression
    let mouthContent = <path d="M 96 95 Q 100 98 104 95" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />;
    let whiskerColor = "#fdba74";

    if (isSick || isVerySick) {
      mouthContent = <path d="M 95 98 Q 100 93 105 98" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />;
      whiskerColor = "#cbd5e1"; // pale whiskers
    } else if (isLow) {
      // open crying mouth
      mouthContent = <ellipse cx="100" cy="96" rx="4" ry="6" fill="#f43f5e" />;
    }

    const tailSpeed = isSick ? "tail-wag-slow" : "tail-wag";

    // Mouse Tracking Parallax values
    const mx = mousePos?.x || 0;
    const my = mousePos?.y || 0;

    return (
      <svg className={`pet-graphic ${shiverClass}`} viewBox="0 0 200 200" width="160" height="160">
        <defs>
          <radialGradient id="cat-body" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#f97316" />
          </radialGradient>
          <radialGradient id="cat-ears" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#ea580c" />
          </radialGradient>
        </defs>
        {/* Tail */}
        <path d="M 135 130 C 155 100, 175 110, 170 85 C 165 60, 140 70, 145 95" fill="none" stroke="#ea580c" strokeWidth="10" strokeLinecap="round" className={tailSpeed} />
        
        {/* Body */}
        <ellipse cx="100" cy="135" rx="52" ry="42" fill="url(#cat-body)" className={breatheClass} />
        <ellipse cx="100" cy="140" rx="30" ry="22" fill="#ffedd5" className={breatheClass} />

        {/* Feet */}
        <circle cx="70" cy="173" r="12" fill="#ea580c" />
        <circle cx="130" cy="173" r="12" fill="#ea580c" />

        {/* Head Group with Mouse Tracking */}
        <g style={{ transform: `translate(${mx * 8}px, ${my * 6}px)`, transformOrigin: "100px 85px", transition: "transform 0.08s ease-out" }}>
          
          {/* Ears */}
          <g className="head-bob" style={{ transform: `translate(${mx * -1.5}px, ${my * -1}px)` }}>
            <polygon points="45,45 75,70 45,85" fill="url(#cat-ears)" />
            <polygon points="48,52 68,70 48,80" fill="#fecdd3" />
            <polygon points="155,45 125,70 155,85" fill="url(#cat-ears)" />
            <polygon points="152,52 132,70 152,80" fill="#fecdd3" />
          </g>

          {/* Head Base */}
          <circle cx="100" cy="85" r="45" fill="url(#cat-body)" className="head-bob" />

          {/* Eyes Group with Additional Parallax */}
          <g style={{ transform: `translate(${mx * 5}px, ${my * 3}px)`, transformOrigin: "100px 78px", transition: "transform 0.08s ease-out" }}>
            {eyeContent}
          </g>

          {/* Snout & Whiskers with Parallax */}
          <g style={{ transform: `translate(${mx * 3}px, ${my * 2}px)`, transformOrigin: "100px 90px", transition: "transform 0.08s ease-out" }}>
            <polygon points="96,88 104,88 100,92" fill="#f43f5e" />
            {/* Whiskers */}
            <line x1="60" y1="90" x2="40" y2="88" stroke={whiskerColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="60" y1="95" x2="38" y2="98" stroke={whiskerColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="140" y1="90" x2="160" y2="88" stroke={whiskerColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="140" y1="95" x2="162" y2="98" stroke={whiskerColor} strokeWidth="2.5" strokeLinecap="round" />
            {mouthContent}
          </g>

        </g>
      </svg>
    );
  },
  panda: (status, hunger, attention, mousePos) => {
    const isSick = status === "sick";
    const isLow = hunger <= 30 || attention <= 30;
    const isVerySick = hunger <= 9 || attention <= 9;
    
    // Breathing state
    const breatheClass = isSick || isLow ? "body-breathe-weak" : "body-breathe-stable";
    const shiverClass = isVerySick ? "body-shiver" : "";

    // Eye expression
    let eyeContent = (
      <>
        <circle cx="80" cy="83" r="4.5" fill="#fff" className="eye-blink" />
        <circle cx="120" cy="83" r="4.5" fill="#fff" className="eye-blink" />
      </>
    );

    if (isSick) {
      eyeContent = (
        <g stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M 77 80 L 83 86" /><path d="M 83 80 L 77 86" />
          <path d="M 117 80 L 123 86" /><path d="M 123 80 L 117 86" />
        </g>
      );
    } else if (isVerySick) {
      eyeContent = (
        <g stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 76 83 L 84 83" />
          <path d="M 116 83 L 124 83" />
        </g>
      );
    } else if (isLow) {
      eyeContent = (
        <g stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none">
          {/* Sad drooping slits */}
          <path d="M 76 85 Q 80 80 84 85" />
          <path d="M 116 85 Q 120 80 124 85" />
        </g>
      );
    }

    // Mouth expression
    let mouthContent = <path d="M 97 103 Q 100 105 103 103" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />;
    if (isSick || isVerySick) {
      mouthContent = <path d="M 96 105 Q 100 101 104 105" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />;
    } else if (isLow) {
      mouthContent = <circle cx="100" cy="104" r="2.5" fill="#1e293b" />;
    }

    // Mouse Tracking Parallax values
    const mx = mousePos?.x || 0;
    const my = mousePos?.y || 0;

    return (
      <svg className={`pet-graphic ${shiverClass}`} viewBox="0 0 200 200" width="160" height="160">
        {/* Body */}
        <ellipse cx="100" cy="135" rx="55" ry="45" fill="#f8fafc" stroke="#1e293b" strokeWidth="8" className={breatheClass} />
        <ellipse cx="100" cy="138" rx="42" ry="32" fill="#1e293b" className={breatheClass} />
        <ellipse cx="100" cy="138" rx="28" ry="22" fill="#f8fafc" className={breatheClass} />

        {/* Feet */}
        <circle cx="65" cy="175" r="14" fill="#1e293b" />
        <circle cx="135" cy="175" r="14" fill="#1e293b" />

        {/* Head Group with Mouse Tracking */}
        <g style={{ transform: `translate(${mx * 8}px, ${my * 6}px)`, transformOrigin: "100px 90px", transition: "transform 0.08s ease-out" }}>
          
          {/* Ears (Round Black) */}
          <g className="head-bob" style={{ transform: `translate(${mx * -1}px, ${my * -1}px)` }}>
            <circle cx="60" cy="50" r="16" fill="#1e293b" />
            <circle cx="140" cy="50" r="16" fill="#1e293b" />
          </g>

          {/* Head Base */}
          <circle cx="100" cy="90" r="46" fill="#f8fafc" stroke="#1e293b" strokeWidth="6" className="head-bob" />

          {/* Black Patches */}
          <g className="head-bob" style={{ transform: `translate(${mx * 4}px, ${my * 2.5}px)`, transition: "transform 0.08s ease-out" }}>
            <ellipse cx="80" cy="85" rx="12" ry="16" fill="#1e293b" transform="rotate(-15 80 85)" />
            <ellipse cx="120" cy="85" rx="12" ry="16" fill="#1e293b" transform="rotate(15 120 85)" />
          </g>

          {/* Eyes Group with Additional Parallax */}
          <g style={{ transform: `translate(${mx * 5.5}px, ${my * 3.5}px)`, transformOrigin: "100px 83px", transition: "transform 0.08s ease-out" }}>
            {eyeContent}
          </g>

          {/* Snout with Parallax */}
          <g style={{ transform: `translate(${mx * 3}px, ${my * 2}px)`, transformOrigin: "100px 100px", transition: "transform 0.08s ease-out" }}>
            <ellipse cx="100" cy="100" rx="9" ry="6" fill="#cbd5e1" />
            <circle cx="100" cy="98" r="4" fill="#1e293b" />
            {mouthContent}
          </g>

        </g>
      </svg>
    );
  },
  bunny: (status, hunger, attention, mousePos) => {
    const isSick = status === "sick";
    const isLow = hunger <= 30 || attention <= 30;
    const isVerySick = hunger <= 9 || attention <= 9;
    
    // Breathing state
    const breatheClass = isSick || isLow ? "body-breathe-weak" : "body-breathe-stable";
    const shiverClass = isVerySick ? "body-shiver" : "";

    // Eye expression
    let eyeContent = (
      <>
        <circle cx="82" cy="78" r="5.5" fill="#fda4af" className="eye-blink" />
        <circle cx="80" cy="76" r="2" fill="#fff" className="eye-blink" />
        <circle cx="118" cy="78" r="5.5" fill="#fda4af" className="eye-blink" />
        <circle cx="116" cy="76" r="2" fill="#fff" className="eye-blink" />
      </>
    );

    if (isSick) {
      eyeContent = (
        <g stroke="#fda4af" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M 78 75 L 84 81" /><path d="M 84 75 L 78 81" />
          <path d="M 114 75 L 120 81" /><path d="M 120 75 L 114 81" />
        </g>
      );
    } else if (isVerySick) {
      eyeContent = (
        <g stroke="#fda4af" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 76 78 L 84 78" />
          <path d="M 116 78 L 124 78" />
        </g>
      );
    } else if (isLow) {
      eyeContent = (
        <>
          <path d="M 76 81 Q 82 75 88 81" fill="none" stroke="#fda4af" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 116 81 Q 122 75 128 81" fill="none" stroke="#fda4af" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    }

    // Mouth expression
    let mouthContent = <path d="M 98 94 Q 100 96 102 94" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />;
    if (isSick || isVerySick) {
      mouthContent = <path d="M 97 96 Q 100 92 103 96" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />;
    } else if (isLow) {
      mouthContent = <circle cx="100" cy="95" r="2" fill="#94a3b8" />;
    }

    // Ear drooping
    const earClass = isSick || isLow ? "ears-droop" : "bunny-ears-bounce";

    // Mouse Tracking Parallax values
    const mx = mousePos?.x || 0;
    const my = mousePos?.y || 0;

    return (
      <svg className={`pet-graphic ${shiverClass}`} viewBox="0 0 200 200" width="160" height="160">
        <defs>
          <radialGradient id="bunny-body" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>
        </defs>
        {/* Tail */}
        <circle cx="148" cy="145" r="14" fill="#e2e8f0" className={breatheClass} />
        <circle cx="146" cy="143" r="10" fill="#fff" className={breatheClass} />

        {/* Body */}
        <ellipse cx="100" cy="138" rx="50" ry="40" fill="url(#bunny-body)" className={breatheClass} />
        
        {/* Feet */}
        <ellipse cx="70" cy="174" rx="14" ry="10" fill="#e2e8f0" />
        <ellipse cx="130" cy="174" rx="14" ry="10" fill="#e2e8f0" />

        {/* Head Group with Mouse Tracking */}
        <g style={{ transform: `translate(${mx * 8}px, ${my * 6}px)`, transformOrigin: "100px 85px", transition: "transform 0.08s ease-out" }}>
          
          {/* Ears */}
          <g className={earClass} style={{ transform: `translate(${mx * -1.5}px, ${my * -1}px)` }}>
            <path d="M 70 55 C 55 5, 80 5, 80 55 Z" fill="#e2e8f0" />
            <path d="M 72 45 C 62 15, 78 15, 76 45 Z" fill="#fda4af" />
            <path d="M 120 55 C 105 5, 130 5, 120 55 Z" fill="#e2e8f0" />
            <path d="M 122 45 C 112 15, 128 15, 126 45 Z" fill="#fda4af" />
          </g>

          {/* Head Base */}
          <circle cx="100" cy="85" r="42" fill="url(#bunny-body)" className="head-bob" />

          {/* Eyes Group with Additional Parallax */}
          <g style={{ transform: `translate(${mx * 5}px, ${my * 3}px)`, transformOrigin: "100px 78px", transition: "transform 0.08s ease-out" }}>
            {eyeContent}
          </g>

          {/* Nose & Whiskers with Parallax */}
          <g style={{ transform: `translate(${mx * 3}px, ${my * 2}px)`, transformOrigin: "100px 88px", transition: "transform 0.08s ease-out" }}>
            <polygon points="97,88 103,88 100,91" fill="#fda4af" />
            {/* Whiskers */}
            <line x1="65" y1="92" x2="48" y2="92" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="135" y1="92" x2="152" y2="92" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            {mouthContent}
          </g>

        </g>
      </svg>
    );
  }
};

export default function PetDashboard() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [pet, setPet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [isPerforming, setIsPerforming] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hearts, setHearts] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  // Sync auth state
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch pet details
  const fetchPet = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/pet/get?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setPet(data.pet);
      } else {
        const errJson = await res.json();
        setError(errJson.error || "Failed to fetch pet details");
      }
    } catch (err) {
      console.error(err);
      setError("Network error fetching pet status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPet();
    const timer = setInterval(fetchPet, 15000);
    return () => clearInterval(timer);
  }, [id]);

  // Mouse Tracking Event Handlers
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRange = 250;
    const r = Math.min(distance / maxRange, 1.0);
    const angle = Math.atan2(dy, dx);
    setMousePos({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      setError("Authentication is not configured on this project.");
      return;
    }
    try {
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user && pet) {
        const res = await fetch("/api/pet/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: pet.id,
            actionType: "talk",
            userUid: result.user.uid,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPet(data.pet);
          addLog("🔑 Claimed pet companion successfully.");
        } else {
          setError(data.error || "Failed to claim pet ownership.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Google Login failed. Please try again.");
    }
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivityLog(prev => [{ text: message, time: timestamp }, ...prev.slice(0, 5)]);
  };

  const spawnHearts = () => {
    const newHearts = Array.from({ length: 6 }).map((_, i) => ({
      id: Math.random(),
      left: 30 + Math.random() * 40,
      delay: i * 0.15,
      scale: 0.5 + Math.random() * 0.8
    }));
    setHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.includes(h)));
    }, 2000);
  };

  const playSoundEffect = (type) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === "munch") {
        let delay = 0;
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "triangle";
            osc.frequency.setValueAtTime(120 + Math.random() * 50, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
          }, delay);
          delay += 100;
        }
      } else if (type === "happy") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {}
  };

  const speakReaction = (text) => {
    if (soundEnabled && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.35;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAction = async (actionType) => {
    if (!pet || !user) return;
    setIsPerforming(true);
    setError("");

    try {
      const res = await fetch("/api/pet/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pet.id,
          actionType,
          userUid: user.uid,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPet(data.pet);
        spawnHearts();
        
        if (actionType === "feed") {
          playSoundEffect("munch");
          addLog(`🍖 Fed ${pet.petName} a tasty snack.`);
          setTimeout(() => {
            speakReaction(`Munch munch! Thank you for the treat!`);
          }, 300);
        } else if (actionType === "play") {
          playSoundEffect("happy");
          addLog(`🎾 Threw a ball. Played catch with ${pet.petName}.`);
          setTimeout(() => {
            speakReaction(`Wahoo! I caught it! Let's play again!`);
          }, 150);
        } else if (actionType === "pet") {
          playSoundEffect("happy");
          addLog(`❤️ Gently patted ${pet.petName} behind the ears.`);
          setTimeout(() => {
            speakReaction(`Aww, that's the spot. I feel so loved!`);
          }, 150);
        } else if (actionType === "talk") {
          playSoundEffect("happy");
          addLog(`💬 Talked to ${pet.petName}.`);
          setTimeout(() => {
            const dialogueOptions = [
              `I was just thinking about how awesome you are!`,
              `Do you think there are other virtual pets in the clouds?`,
              `I love hanging out in your pocket!`,
              `Are we best friends? I think we are!`,
            ];
            const randomDialogue = dialogueOptions[Math.floor(Math.random() * dialogueOptions.length)];
            speakReaction(randomDialogue);
          }, 150);
        }
      } else {
        setError(data.error || "Failed to perform action");
      }
    } catch (err) {
      console.error(err);
      setError("Network error performing action");
    } finally {
      setIsPerforming(false);
    }
  };

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  if (error && !pet) {
    return (
      <div className="pet-dash-root min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <span className="text-4xl block mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Pet Not Found</h2>
          <p className="text-xs text-rose-400 leading-relaxed mb-6">{error}</p>
          <Link href="/" className="inline-block bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full no-underline transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !pet) {
    return (
      <div className="pet-dash-root min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-400">Entering digital playroom...</p>
        </div>
      </div>
    );
  }

  const isClaimed = !!pet.receiverUid;
  const isOwner = user && pet.receiverUid === user.uid;
  const showClaimLanding = !user || (!isOwner && !isClaimed);

  // Computed state visual helpers
  let statusText = "Healthy & Happy";
  let statusColor = "#10b981";
  let statusBg = "rgba(16, 185, 129, 0.15)";
  let petBubble = `Hi there! I am ${pet.petName}. Let's play!`;

  if (pet.status === "runaway") {
    statusText = "Ran Away";
    statusColor = "#ef4444";
    statusBg = "rgba(239, 68, 68, 0.15)";
    petBubble = `${pet.petName} felt lonely & ran away back to ${pet.senderName}'s yard!`;
  } else if (pet.status === "sick") {
    statusText = "Sick & Cold";
    statusColor = "#f59e0b";
    statusBg = "rgba(245, 158, 11, 0.15)";
    petBubble = `Achoo! I feel cold and sick. Please feed or pet me.`;
  } else if (pet.hunger <= 30) {
    statusText = "Very Hungry";
    statusColor = "#f59e0b";
    statusBg = "rgba(245, 158, 11, 0.15)";
    petBubble = "My tummy is rumbling! Do you have any treats?";
  } else if (pet.attention <= 30) {
    statusText = "Lonely";
    statusColor = "#a855f7";
    statusBg = "rgba(168, 85, 247, 0.15)";
    petBubble = "It's quiet in here. Can you pet or play with me?";
  }

  return (
    <div className="pet-dash-root min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center relative overflow-hidden pb-12">
      
      {/* Premium Background Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,700;1,400&display=swap');
        
        .pet-dash-root {
          font-family: 'Outfit', sans-serif;
        }
        
        .font-serif-playfair {
          font-family: 'Playfair Display', serif;
        }

        .glass-panel {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        /* Ambient floating hearts */
        .heart-float {
          position: absolute;
          font-size: 1.5rem;
          color: #f43f5e;
          pointer-events: none;
          animation: floatUp 2s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
          opacity: 0;
          z-index: 10;
        }

        @keyframes floatUp {
          0% { transform: translateY(20px) scale(0.5); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(-130px) scale(1.2); opacity: 0; }
        }

        /* Breathing body animation - Slow & Deep when stable */
        .body-breathe-stable {
          animation: deepBreathe 3.5s infinite ease-in-out;
          transform-origin: 100px 135px;
        }

        /* Breathing body animation - Fast & Shallow when neglected/low stats */
        .body-breathe-weak {
          animation: shallowBreathe 1.1s infinite ease-in-out;
          transform-origin: 100px 135px;
        }

        @keyframes deepBreathe {
          0%, 100% { transform: scale(1.0, 1.0) translateY(0); }
          50% { transform: scale(1.05, 0.95) translateY(2px); }
        }

        @keyframes shallowBreathe {
          0%, 100% { transform: scale(1.0, 1.0) translateY(0); }
          50% { transform: scale(1.02, 0.98) translateY(1px); }
        }

        /* Shivering effect for extremely sick pets */
        .body-shiver {
          animation: shiver 0.12s infinite linear;
        }

        @keyframes shiver {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-1.2px, 0.8px); }
          40% { transform: translate(0.8px, -1.2px); }
          60% { transform: translate(-1.2px, -0.8px); }
          80% { transform: translate(1.2px, 1.2px); }
        }

        /* Head bobbing animation */
        .head-bob {
          animation: bob 4.4s infinite ease-in-out;
          transform-origin: center 85px;
        }

        @keyframes bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(2px) rotate(1.5deg); }
        }

        /* Tail wagging */
        .tail-wag {
          animation: wag 0.8s infinite ease-in-out;
          transform-origin: 135px 120px;
        }
        .tail-wag-slow {
          animation: wag 1.8s infinite ease-in-out;
          transform-origin: 135px 120px;
        }

        @keyframes wag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(18deg); }
        }

        /* Eye Blinking */
        .eye-blink {
          animation: blink 4.2s infinite ease-in-out;
          transform-origin: center 78px;
        }

        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }

        /* Ear Perking */
        .ears-perky {
          animation: perk 3s infinite ease-in-out;
          transform-origin: center 60px;
        }

        @keyframes perk {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-2deg); }
        }

        .ears-droop {
          transform: translateY(4px) scaleY(0.88);
          transform-origin: center 60px;
        }

        .bunny-ears-bounce {
          animation: bunnyEars 1.6s infinite ease-in-out;
          transform-origin: center 55px;
        }

        @keyframes bunnyEars {
          0%, 100% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(3deg) scaleY(0.96); }
        }

        /* Bubble speech block styling */
        .bubble-speech {
          background: rgba(244, 63, 94, 0.08);
          border: 1px solid rgba(244, 63, 94, 0.2);
          position: relative;
        }

        .bubble-speech::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px 8px 0;
          border-style: solid;
          border-color: rgba(15, 23, 42, 0.65) transparent;
          display: block;
          width: 0;
        }

        /* Soft neon progress bars */
        .prog-bg {
          background: rgba(255, 255, 255, 0.04);
          height: 10px;
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .prog-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .act-btn {
          border: none;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #f1f5f9;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .act-btn:hover:not(:disabled) {
          background: rgba(244, 63, 94, 0.15);
          border-color: rgba(244, 63, 94, 0.4);
          color: #f43f5e;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(244, 63, 94, 0.15);
        }

        .act-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .g-shimmer {
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          box-shadow: 0 8px 24px rgba(236, 72, 153, 0.35);
          transition: all 0.3s ease;
        }

        .g-shimmer:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(236, 72, 153, 0.45);
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-solid border-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <img src="/logo-transparent.png" alt="Petals and Words" className="h-8" />
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className="text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
            >
              {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
            </button>
            {user && (
              <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-slate-200 bg-none border-none cursor-pointer">
                Logout ({user.displayName?.split(" ")[0]})
              </button>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="w-full max-w-xl px-4 mt-8 z-10">
        
        {/* ── CASE A: Claim / Google Auth Landing Screen ── */}
        {showClaimLanding && (
          <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-xl pointer-events-none" />
            
            <span className="text-xs font-extrabold uppercase tracking-widest text-pink-500 block mb-2">
              Virtual Gift Package
            </span>
            <h1 className="font-serif-playfair text-3xl md:text-4xl font-extrabold text-slate-100 mb-4 leading-tight">
              You Received a Pet!
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-md mx-auto">
              <strong>{pet.senderName}</strong> sent you a sweet virtual companion named <strong>{pet.petName}</strong>! Claim them below to begin your pet-care adventure.
            </p>

            {/* Closed Gift Box */}
            <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center bg-slate-900/60 rounded-3xl border border-solid border-slate-800 shadow-inner">
              <span className="text-7xl pet-bounce select-none">🎁</span>
              <div className="absolute bottom-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Tap box to adopt
              </div>
            </div>

            {error && (
              <div className="bg-rose-950/40 text-rose-400 p-4 rounded-xl text-xs font-semibold border border-solid border-rose-900/50 mb-6">
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleGoogleLogin} className="g-shimmer pd-btn text-white w-full max-w-xs mx-auto flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Adopt with Google Account
            </button>
          </div>
        )}

        {/* ── CASE B: Active Pet Care Playground ── */}
        {user && !showClaimLanding && (
          <div className="flex flex-col gap-6">
            
            {/* Owner Mismatch Guard */}
            {pet.receiverUid && pet.receiverUid !== user.uid ? (
              <div className="glass-panel rounded-[2.5rem] p-10 text-center">
                <span className="text-4xl block mb-4">⛔</span>
                <h2 className="text-lg font-bold text-slate-100 mb-2">Access Denied</h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  This pet belongs to another user. If this is your pet, please log out and sign in using the correct Google Account.
                </p>
                <button onClick={handleLogout} className="act-btn pd-btn">
                  Logout Account
                </button>
              </div>
            ) : (
              <>
                {/* Main Playroom Card */}
                <div 
                  className="glass-panel rounded-[2.5rem] p-6 md:p-8 text-center relative overflow-hidden"
                  ref={cardRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  
                  {/* Hearts floating animations layer */}
                  {hearts.map((h) => (
                    <div
                      key={h.id}
                      className="heart-float"
                      style={{
                        left: `${h.left}%`,
                        animationDelay: `${h.delay}s`,
                        transform: `scale(${h.scale})`,
                      }}
                    >
                      ❤️
                    </div>
                  ))}

                  {/* Header Status Monitor */}
                  <div className="flex items-center justify-between mb-6 border-b border-solid border-slate-800 pb-4">
                    <div className="text-left">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Companion Name</span>
                      <p className="font-extrabold text-base text-slate-100">{pet.petName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Status</span>
                      <p className="font-extrabold text-xs uppercase tracking-wide flex items-center gap-1.5" style={{ color: statusColor }}>
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
                        {statusText}
                      </p>
                    </div>
                  </div>

                  {/* Dialogue Speech Bubble */}
                  <div className="bubble-speech rounded-2xl p-4 max-w-sm mx-auto mb-6 text-xs text-pink-400 font-bold leading-normal">
                    {petBubble}
                  </div>

                  {/* Animated SVG Character / Rive */}
                  <div className="w-full h-44 flex items-center justify-center select-none my-4">
                    <RivePet
                      petType={pet.petType}
                      status={pet.status}
                      hunger={pet.hunger}
                      attention={pet.attention}
                      fallbackSvg={
                        PET_VISUALS[pet.petType]
                          ? PET_VISUALS[pet.petType](pet.status, pet.hunger, pet.attention, mousePos)
                          : PET_VISUALS.kitten(pet.status, pet.hunger, pet.attention, mousePos)
                      }
                    />
                  </div>

                  {/* ── Interactive Stats Controls ── */}
                  <div className="flex flex-col gap-4 max-w-sm mx-auto my-6 text-left">
                    
                    {/* Hunger stat */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>🍖 Hunger (Fullness)</span>
                        <span style={{ color: pet.hunger <= 30 ? "#f43f5e" : "#f1f5f9" }}>{pet.hunger}%</span>
                      </div>
                      <div className="prog-bg">
                        <div
                          className="prog-fill"
                          style={{
                            width: `${pet.hunger}%`,
                            backgroundColor: pet.hunger <= 30 ? "#f43f5e" : pet.hunger <= 70 ? "#f59e0b" : "#10b981",
                          }}
                        />
                      </div>
                    </div>

                    {/* Mood / Attention stat */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>🎾 Attention / Mood</span>
                        <span style={{ color: pet.attention <= 30 ? "#f43f5e" : "#f1f5f9" }}>{pet.attention}%</span>
                      </div>
                      <div className="prog-bg">
                        <div
                          className="prog-fill"
                          style={{
                            width: `${pet.attention}%`,
                            backgroundColor: pet.attention <= 30 ? "#f43f5e" : pet.attention <= 70 ? "#f59e0b" : "#10b981",
                          }}
                        />
                      </div>
                    </div>

                  </div>

                  {error && (
                    <div className="bg-rose-950/40 text-rose-400 p-3 rounded-xl text-xs font-semibold border border-solid border-rose-900/50 mb-4">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Action buttons with glowing shadows */}
                  <div className="grid grid-cols-4 gap-2 mt-6">
                    <button
                      onClick={() => handleAction("feed")}
                      disabled={isPerforming || pet.status === "runaway"}
                      className="act-btn pd-btn rounded-xl"
                      title="Feed Pet"
                    >
                      🍖 Feed
                    </button>
                    <button
                      onClick={() => handleAction("play")}
                      disabled={isPerforming || pet.status === "runaway"}
                      className="act-btn pd-btn rounded-xl"
                      title="Play Catch"
                    >
                      🎾 Play
                    </button>
                    <button
                      onClick={() => handleAction("pet")}
                      disabled={isPerforming || pet.status === "runaway"}
                      className="act-btn pd-btn rounded-xl"
                      title="Pet"
                    >
                      ❤️ Pet
                    </button>
                    <button
                      onClick={() => handleAction("talk")}
                      disabled={isPerforming || pet.status === "runaway"}
                      className="act-btn pd-btn rounded-xl"
                      title="Talk"
                    >
                      💬 Talk
                    </button>
                  </div>

                </div>

                {/* Activity Feed logs */}
                <div className="glass-panel rounded-[2rem] p-6 text-left">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-4">
                    Activity Logs
                  </span>
                  {activityLog.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No activities logged yet. Tap buttons above to interact!</p>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {activityLog.map((log, i) => (
                        <div key={i} className="flex justify-between items-center text-xs border-b border-solid border-slate-900 pb-1.5">
                          <span className="text-slate-300 font-semibold">{log.text}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sender Card message */}
                <div className="glass-panel rounded-[2rem] p-6 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">
                    Card Note from {pet.senderName}
                  </span>
                  <p className="text-xs italic text-slate-300 leading-relaxed font-serif-playfair">
                    "{pet.message || "I adopted this companion for you! Keep them happy and well-fed!"}"
                  </p>
                </div>
              </>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
