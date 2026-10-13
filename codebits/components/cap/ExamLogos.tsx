import React from "react";

interface LogoProps {
  className?: string;
}

// 1. MHT CET - State CET Cell Maharashtra
export const MhtCetLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/mahacet.svg"
    alt="State CET Cell Maharashtra"
    className={`${className} object-contain`}
    loading="lazy"
  />
);

// 2. JEE Main - National Testing Agency (NTA)
export const JeeMainLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/nta.png"
    alt="National Testing Agency (NTA)"
    className={`${className} object-contain`}
    loading="lazy"
  />
);

// 3. NEET (UG) - National Testing Agency (NTA)
export const NeetLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/nta.png"
    alt="National Testing Agency (NTA)"
    className={`${className} object-contain`}
    loading="lazy"
  />
);

// 4. JEE Advanced - IIT Joint Admission Board
export const JeeAdvancedLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/iit.svg"
    alt="IIT Joint Admission Board"
    className={`${className} object-contain`}
    loading="lazy"
  />
);

// 5. BITSAT - BITS Pilani
export const BitsatLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/bits.svg"
    alt="BITS Pilani"
    className={`${className} object-contain`}
    loading="lazy"
  />
);

// 6. VITEEE - Vellore Institute of Technology
export const ViteeeLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/vit.svg"
    alt="Vellore Institute of Technology"
    className={`${className} object-contain`}
    loading="lazy"
  />
);

// 7. UGEE - IIIT Hyderabad
export const UgeeLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/iiith.png"
    alt="IIIT Hyderabad"
    className={`${className} object-contain`}
    loading="lazy"
  />
);

// 8. COMEDK - Karnataka Consortium
export const ComedkLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/comedk.jpg"
    alt="COMEDK Karnataka"
    className={`${className} object-contain rounded-sm`}
    loading="lazy"
  />
);

// 9. GATE - IITs / IISc
export const GateLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/iit.svg"
    alt="GATE - IITs / IISc"
    className={`${className} object-contain`}
    loading="lazy"
  />
);

// 10. CAT - Indian Institutes of Management (IIMs)
export const CatLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/iim.png"
    alt="Indian Institutes of Management (IIMs)"
    className={`${className} object-contain`}
    loading="lazy"
  />
);

// 11. GRE / TOEFL - Educational Testing Service (ETS)
export const GreLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/ets.png"
    alt="ETS"
    className={`${className} object-contain`}
    loading="lazy"
  />
);

// 12. IES / ESE - Union Public Service Commission (UPSC)
export const IesLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/upsc.svg"
    alt="Union Public Service Commission"
    className={`${className} object-contain`}
    loading="lazy"
  />
);

// 13. ISRO / BARC - Indian Space Research Organisation
export const IsroLogo = ({ className = "w-10 h-10" }: LogoProps) => (
  <img
    src="/logos/exams/isro.svg"
    alt="ISRO"
    className={`${className} object-contain`}
    loading="lazy"
  />
);
