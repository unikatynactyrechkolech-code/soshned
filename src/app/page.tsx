"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map, { Marker } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import {
  KeyRound,
  Truck,
  Wrench,
  Droplets,
  Siren,
  Loader2,
  CheckCircle2,
  X,
  Phone,
  Clock,
  Menu,
  User,
  Search,
  Star,
  ArrowLeft,
  Mail,
  Shield,
  Info,
  Heart,
  MapPin,
  ChevronRight,
  MessageCircle,
  Settings,
  LogOut,
  Bell,
  CreditCard,
  HelpCircle,
  PhoneCall,
  Globe,
  Satellite,
  Box,
  Layers,
  ExternalLink,
  Navigation,
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/* ================================================================== */
/*  HELPER                                                            */
/* ================================================================== */
function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

/* ================================================================== */
/*  TYPES                                                             */
/* ================================================================== */

type Profession = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  gradient: string;
  techName: string;
  techPerson: string;
  eta: string;
  keywords: string[];
};

type ServiceProvider = {
  id: string;
  name: string;
  profession: string;
  professionId: string;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
  pinColor: string;
  pinBg: string;
  pinRing: string;
  pinShadow: string;
  icon: React.ElementType;
  eta: string;
  price: string;
  phone: string;
  website: string;
  address: string;
  description: string;
  reviews: { author: string; text: string; rating: number; date: string }[];
};

type AppState = "idle" | "selected" | "searching" | "found";
type Panel = null | "menu" | "profile" | "service" | "contact" | "about";

type MapMode = "2d" | "3d" | "satellite" | "map";

const MAP_STYLES: Record<MapMode, { style: string; pitch: number; label: string; icon: React.ElementType }> = {
  "2d": { style: "mapbox://styles/mapbox/dark-v11", pitch: 0, label: "2D", icon: Layers },
  "3d": { style: "mapbox://styles/mapbox/dark-v11", pitch: 60, label: "3D", icon: Box },
  satellite: { style: "mapbox://styles/mapbox/satellite-streets-v12", pitch: 50, label: "Satelit", icon: Satellite },
  map: { style: "mapbox://styles/mapbox/streets-v12", pitch: 0, label: "Mapa", icon: Globe },
};

/* ================================================================== */
/*  MOCK DATA                                                         */
/* ================================================================== */

const PROFESSIONS: Profession[] = [
  {
    id: "zamecnik",
    label: "Zámečník",
    icon: KeyRound,
    color: "ring-amber-400/60",
    glowColor: "shadow-amber-500/25",
    gradient: "from-amber-500/20 to-amber-600/5",
    techName: "Non-Stop Zámky s.r.o.",
    techPerson: "Karel M.",
    eta: "~12 min",
    keywords: ["zámek", "klíč", "dveře", "zabouchnutí", "zamčeno", "zamecnik"],
  },
  {
    id: "odtahovka",
    label: "Odtahovka",
    icon: Truck,
    color: "ring-blue-400/60",
    glowColor: "shadow-blue-500/25",
    gradient: "from-blue-500/20 to-blue-600/5",
    techName: "AutoPomoc 24/7",
    techPerson: "Petr V.",
    eta: "~8 min",
    keywords: ["auto", "odtah", "nehoda", "porucha", "havárie", "odtahovka"],
  },
  {
    id: "servis",
    label: "Servisy",
    icon: Wrench,
    color: "ring-purple-400/60",
    glowColor: "shadow-purple-500/25",
    gradient: "from-purple-500/20 to-purple-600/5",
    techName: "TechServis Praha",
    techPerson: "Lukáš D.",
    eta: "~15 min",
    keywords: ["oprava", "servis", "technik", "spotřebič", "závada"],
  },
  {
    id: "instalater",
    label: "Hav. Instalatér",
    icon: Droplets,
    color: "ring-cyan-400/60",
    glowColor: "shadow-cyan-500/25",
    gradient: "from-cyan-500/20 to-cyan-600/5",
    techName: "AquaFix Havarijní",
    techPerson: "Tomáš K.",
    eta: "~10 min",
    keywords: ["voda", "trubka", "instalatér", "protéká", "kohoutek", "topení"],
  },
];

const SERVICES: ServiceProvider[] = [
  {
    id: "s1", name: "Non-Stop Zámky s.r.o.", profession: "Zámečník", professionId: "zamecnik",
    rating: 4.9, reviewCount: 127, lat: 50.0812, lng: 14.4295,
    pinColor: "text-amber-400", pinBg: "bg-amber-500", pinRing: "ring-amber-400/50", pinShadow: "shadow-amber-500/40",
    icon: KeyRound, eta: "~8 min", price: "od 890 Kč", phone: "+420 777 111 222", website: "https://nonstozamky.cz",
    address: "Dlouhá 12, Praha 1",
    description: "Nonstop zámečnická pohotovost. Otevření zabouchnutých dveří, výměna vložek, montáž bezpečnostních zámků.",
    reviews: [
      { author: "Jana K.", text: "Přijeli za 10 minut, profesionální přístup. Dveře otevřeny bez poškození.", rating: 5, date: "před 2 dny" },
      { author: "Martin P.", text: "Trochu dražší, ale kvalitní práce a rychlost.", rating: 4, date: "před týdnem" },
      { author: "Eva S.", text: "Zachránili mě v noci, absolutní pohoda.", rating: 5, date: "před 2 týdny" },
    ],
  },
  {
    id: "s2", name: "KeyMaster Praha", profession: "Zámečník", professionId: "zamecnik",
    rating: 4.6, reviewCount: 84, lat: 50.0695, lng: 14.4520,
    pinColor: "text-yellow-400", pinBg: "bg-yellow-500", pinRing: "ring-yellow-400/50", pinShadow: "shadow-yellow-500/40",
    icon: KeyRound, eta: "~14 min", price: "od 750 Kč", phone: "+420 602 333 444", website: "https://keymaster.cz",
    address: "Vinohradská 45, Praha 2",
    description: "Rodinná zámečnická firma s 15letou tradicí. Specializace na bezpečnostní dveře a trezory.",
    reviews: [
      { author: "Petr H.", text: "Spolehlivá firma, doporučuji všem.", rating: 5, date: "před 3 dny" },
      { author: "Lucie M.", text: "Rychlý příjezd, férová cena.", rating: 4, date: "před měsícem" },
    ],
  },
  {
    id: "s3", name: "AutoPomoc 24/7", profession: "Odtahovka", professionId: "odtahovka",
    rating: 4.8, reviewCount: 203, lat: 50.0880, lng: 14.4180,
    pinColor: "text-blue-400", pinBg: "bg-blue-500", pinRing: "ring-blue-400/50", pinShadow: "shadow-blue-500/40",
    icon: Truck, eta: "~6 min", price: "od 1200 Kč", phone: "+420 800 200 300", website: "https://autopomoc247.cz",
    address: "Na Příkopě 8, Praha 1",
    description: "Odtahová služba nonstop. Přeprava osobních i dodávkových vozidel, startování, výměna kol.",
    reviews: [
      { author: "Tomáš R.", text: "Bleskový příjezd, auto naložili šetrně. Super služba!", rating: 5, date: "včera" },
      { author: "Alena V.", text: "Pomohli mi na dálnici D1, velmi profesionální.", rating: 5, date: "před týdnem" },
      { author: "David K.", text: "Cena odpovídá kvalitě, žádné skryté poplatky.", rating: 4, date: "před 2 týdny" },
    ],
  },
  {
    id: "s4", name: "TowTruck Express", profession: "Odtahovka", professionId: "odtahovka",
    rating: 4.4, reviewCount: 67, lat: 50.0720, lng: 14.4600,
    pinColor: "text-sky-400", pinBg: "bg-sky-500", pinRing: "ring-sky-400/50", pinShadow: "shadow-sky-500/40",
    icon: Truck, eta: "~12 min", price: "od 990 Kč", phone: "+420 603 555 666", website: "https://towtruck.cz",
    address: "Korunní 78, Praha 10",
    description: "Rychlé odtahy po celé Praze. Speciální vozidla pro nízko položená auta.",
    reviews: [
      { author: "Ondřej B.", text: "Dobrá služba za rozumnou cenu.", rating: 4, date: "před 5 dny" },
      { author: "Markéta J.", text: "Přijeli rychle, řidič byl milý.", rating: 5, date: "před měsícem" },
    ],
  },
  {
    id: "s5", name: "TechServis Praha", profession: "Servisy", professionId: "servis",
    rating: 4.7, reviewCount: 156, lat: 50.0650, lng: 14.4250,
    pinColor: "text-purple-400", pinBg: "bg-purple-500", pinRing: "ring-purple-400/50", pinShadow: "shadow-purple-500/40",
    icon: Wrench, eta: "~15 min", price: "od 600 Kč", phone: "+420 776 888 999", website: "https://techservis.cz",
    address: "Národní 20, Praha 1",
    description: "Opravy spotřebičů, elektroniky a domácích technologií. Certifikovaní technici značek Bosch, Siemens, Samsung.",
    reviews: [
      { author: "Helena Č.", text: "Opravili mi pračku ještě ten den. Spokojenost!", rating: 5, date: "před 3 dny" },
      { author: "Jakub N.", text: "Profesionální přístup, přehledný ceník.", rating: 4, date: "před týdnem" },
      { author: "Monika T.", text: "Perfektní servis, doporučuji.", rating: 5, date: "před měsícem" },
    ],
  },
  {
    id: "s6", name: "FixIt Servisy", profession: "Servisy", professionId: "servis",
    rating: 4.3, reviewCount: 42, lat: 50.0790, lng: 14.4550,
    pinColor: "text-violet-400", pinBg: "bg-violet-500", pinRing: "ring-violet-400/50", pinShadow: "shadow-violet-500/40",
    icon: Wrench, eta: "~20 min", price: "od 500 Kč", phone: "+420 608 222 111", website: "https://fixit-servisy.cz",
    address: "Žižkova 55, Praha 3",
    description: "Údržba a opravy pro domácnosti i firmy. Elektro, plyn, voda — vše pod jednou střechou.",
    reviews: [
      { author: "Roman S.", text: "Solidní práce, dorazili včas.", rating: 4, date: "před 4 dny" },
      { author: "Tereza L.", text: "Opravili kotel za hodinu, super.", rating: 5, date: "před 2 týdny" },
    ],
  },
  {
    id: "s7", name: "AquaFix Havarijní", profession: "Hav. Instalatér", professionId: "instalater",
    rating: 4.8, reviewCount: 189, lat: 50.0770, lng: 14.4100,
    pinColor: "text-cyan-400", pinBg: "bg-cyan-500", pinRing: "ring-cyan-400/50", pinShadow: "shadow-cyan-500/40",
    icon: Droplets, eta: "~10 min", price: "od 950 Kč", phone: "+420 721 444 555", website: "https://aquafix.cz",
    address: "Štefánikova 3, Praha 5",
    description: "Havarijní instalatérská služba 24/7. Prasklé trubky, ucpané odpady, opravy kotlů a bojlerů.",
    reviews: [
      { author: "Klára B.", text: "Záchrana života! Praskla trubka ve 2 ráno a za 15 min byli na místě.", rating: 5, date: "včera" },
      { author: "František D.", text: "Kvalitní práce, férová cena, doporučuji.", rating: 5, date: "před týdnem" },
      { author: "Ivana P.", text: "Rychlí a spolehliví, žádné zbytečné řeči.", rating: 4, date: "před 3 týdny" },
    ],
  },
  {
    id: "s8", name: "VodoServis Plus", profession: "Hav. Instalatér", professionId: "instalater",
    rating: 4.5, reviewCount: 93, lat: 50.0850, lng: 14.4480,
    pinColor: "text-teal-400", pinBg: "bg-teal-500", pinRing: "ring-teal-400/50", pinShadow: "shadow-teal-500/40",
    icon: Droplets, eta: "~18 min", price: "od 800 Kč", phone: "+420 733 666 777", website: "https://vodoservis.cz",
    address: "Dejvická 10, Praha 6",
    description: "Kompletní instalatérské služby — od oprav po rekonstrukce koupelen. Působíme po celé Praze.",
    reviews: [
      { author: "Michal J.", text: "Opravili odpad za půl hodiny, super.", rating: 5, date: "před 2 dny" },
      { author: "Anna R.", text: "Slušná cena, příjemný technik.", rating: 4, date: "před měsícem" },
    ],
  },
  {
    id: "s9", name: "RapidKey Nonstop", profession: "Zámečník", professionId: "zamecnik",
    rating: 4.2, reviewCount: 38, lat: 50.0680, lng: 14.4380,
    pinColor: "text-orange-400", pinBg: "bg-orange-500", pinRing: "ring-orange-400/50", pinShadow: "shadow-orange-500/40",
    icon: KeyRound, eta: "~11 min", price: "od 690 Kč", phone: "+420 605 999 888", website: "https://rapidkey.cz",
    address: "Resslova 6, Praha 2",
    description: "Otevírání dveří, aut, trezorů. Expresní servis pro celou Prahu a okolí.",
    reviews: [
      { author: "Štěpán V.", text: "Otevřeli auto za 5 minut, super!", rating: 5, date: "před týdnem" },
      { author: "Barbora K.", text: "Přijeli rychle, cena ok.", rating: 4, date: "před 2 týdny" },
    ],
  },
  {
    id: "s10", name: "PrahaOdtah.cz", profession: "Odtahovka", professionId: "odtahovka",
    rating: 4.6, reviewCount: 112, lat: 50.0730, lng: 14.4050,
    pinColor: "text-indigo-400", pinBg: "bg-indigo-500", pinRing: "ring-indigo-400/50", pinShadow: "shadow-indigo-500/40",
    icon: Truck, eta: "~9 min", price: "od 1100 Kč", phone: "+420 800 100 200", website: "https://prahaodtah.cz",
    address: "Plzeňská 120, Praha 5",
    description: "Odtahová služba s vlastním parkovištěm. Pomoc při nehodách, defektech, vybité baterii.",
    reviews: [
      { author: "Vladimír H.", text: "Skvělá služba, řidič pomohl i s papíry pro pojišťovnu.", rating: 5, date: "před 3 dny" },
      { author: "Simona Č.", text: "Spolehlivá firma, využívám opakovaně.", rating: 5, date: "před 2 týdny" },
    ],
  },
  {
    id: "s11", name: "Zámky Nonstop Praha", profession: "Zámečník", professionId: "zamecnik",
    rating: 4.1, reviewCount: 29, lat: 50.0920, lng: 14.4400,
    pinColor: "text-rose-400", pinBg: "bg-rose-500", pinRing: "ring-rose-400/50", pinShadow: "shadow-rose-500/40",
    icon: KeyRound, eta: "~16 min", price: "od 590 Kč", phone: "+420 774 321 654", website: "https://zamkynonstop.cz",
    address: "Bubenská 1, Praha 7",
    description: "Levné otevírání zabouchnutých dveří. Studentská sleva 10 %. Působíme po celé Praze 7 a okolí.",
    reviews: [
      { author: "Kateřina V.", text: "Levné a rychlé. Doporučuji studentům!", rating: 4, date: "před týdnem" },
      { author: "Jiří P.", text: "Za tu cenu super služba.", rating: 4, date: "před 3 týdny" },
    ],
  },
  {
    id: "s12", name: "ElektroFix 24h", profession: "Servisy", professionId: "servis",
    rating: 4.9, reviewCount: 211, lat: 50.0600, lng: 14.4450,
    pinColor: "text-pink-400", pinBg: "bg-pink-500", pinRing: "ring-pink-400/50", pinShadow: "shadow-pink-500/40",
    icon: Wrench, eta: "~10 min", price: "od 700 Kč", phone: "+420 606 111 000", website: "https://elektrofix.cz",
    address: "Nuselská 38, Praha 4",
    description: "Nonstop elektrikář. Výpadky proudu, zkraty, opravy rozvaděčů, instalace jističů a zásuvek.",
    reviews: [
      { author: "Pavel M.", text: "Vyřešili zkrat za půl hodiny, super profík!", rating: 5, date: "včera" },
      { author: "Dana K.", text: "Přijeli o víkendu, žádný příplatek. Bomba.", rating: 5, date: "před 4 dny" },
      { author: "Vojtěch S.", text: "Profesionální práce, čistota.", rating: 5, date: "před 2 týdny" },
    ],
  },
  {
    id: "s13", name: "HydroHelp Praha", profession: "Hav. Instalatér", professionId: "instalater",
    rating: 4.3, reviewCount: 58, lat: 50.0710, lng: 14.4700,
    pinColor: "text-emerald-400", pinBg: "bg-emerald-500", pinRing: "ring-emerald-400/50", pinShadow: "shadow-emerald-500/40",
    icon: Droplets, eta: "~14 min", price: "od 850 Kč", phone: "+420 777 654 321", website: "https://hydrohelp.cz",
    address: "Vršovická 68, Praha 10",
    description: "Havarijní vodoinstalatér pro Prahu 10 a okolí. Opravy vodovodů, odpadů, montáž baterií.",
    reviews: [
      { author: "Lenka H.", text: "Přijeli za 10 minut, problém vyřešen.", rating: 5, date: "před 3 dny" },
      { author: "Tomáš N.", text: "Trochu dražší, ale kvalita sedí.", rating: 4, date: "před měsícem" },
    ],
  },
  {
    id: "s14", name: "AutoAngel Odtah", profession: "Odtahovka", professionId: "odtahovka",
    rating: 4.7, reviewCount: 145, lat: 50.0580, lng: 14.4150,
    pinColor: "text-lime-400", pinBg: "bg-lime-500", pinRing: "ring-lime-400/50", pinShadow: "shadow-lime-500/40",
    icon: Truck, eta: "~7 min", price: "od 1050 Kč", phone: "+420 800 555 111", website: "https://autoangel.cz",
    address: "Kartouzská 4, Praha 5",
    description: "Prémiová odtahová služba. Šetrné nakládání, GPS tracking, pojistné poradenství zdarma.",
    reviews: [
      { author: "Martin D.", text: "Luxusní služba! Řidič super, pojistku vyřídil za mě.", rating: 5, date: "před 2 dny" },
      { author: "Zuzana P.", text: "Nejlepší odtahovka v Praze.", rating: 5, date: "před týdnem" },
      { author: "Kamil R.", text: "Trochu čekání, ale profesionální přístup.", rating: 4, date: "před 3 týdny" },
    ],
  },
  {
    id: "s15", name: "ProfiServis Elektro", profession: "Servisy", professionId: "servis",
    rating: 4.5, reviewCount: 78, lat: 50.0900, lng: 14.4620,
    pinColor: "text-fuchsia-400", pinBg: "bg-fuchsia-500", pinRing: "ring-fuchsia-400/50", pinShadow: "shadow-fuchsia-500/40",
    icon: Wrench, eta: "~18 min", price: "od 550 Kč", phone: "+420 608 777 333", website: "https://profiservis.cz",
    address: "Zenklova 22, Praha 8",
    description: "Opravy praček, sušiček, myček a dalších domácích spotřebičů všech značek. Záruka 12 měsíců.",
    reviews: [
      { author: "Radek T.", text: "Opravili myčku za hodinu, super cena.", rating: 5, date: "před 5 dny" },
      { author: "Nikola S.", text: "Spolehlivý servis, ráda se vrátím.", rating: 4, date: "před 2 týdny" },
    ],
  },
];

/* Mock coordinates — Prague center */
const CUSTOMER_COORDS = { latitude: 50.0755, longitude: 14.4378 };
const TECH_COORDS = { latitude: 50.0825, longitude: 14.4265 };

/* ================================================================== */
/*  STAR RATING COMPONENT                                             */
/* ================================================================== */
function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-white/15"
          )}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

/* ================================================================== */
/*  SLIDE PANEL WRAPPER                                               */
/* ================================================================== */
function SlidePanel({
  isOpen,
  onClose,
  direction = "right",
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  direction?: "left" | "right" | "bottom";
  children: React.ReactNode;
}) {
  const variants = {
    left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
    right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
    bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  };
  const v = variants[direction];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={v.initial}
            animate={v.animate}
            exit={v.exit}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className={cn(
              "fixed z-50 bg-[#0c0c14] overflow-y-auto overflow-x-hidden",
              direction === "bottom"
                ? "inset-x-0 bottom-0 top-[8%] rounded-t-3xl"
                : direction === "left"
                  ? "inset-y-0 left-0 w-[85%] max-w-[340px]"
                  : "inset-y-0 right-0 w-[85%] max-w-[340px]"
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ================================================================== */
/*  MENU PANEL                                                        */
/* ================================================================== */
function MenuPanel({ onClose, onNavigate }: { onClose: () => void; onNavigate: (p: Panel) => void }) {
  const menuItems = [
    { icon: Info, label: "O aplikaci", panel: "about" as Panel },
    { icon: PhoneCall, label: "Kontakt na správce", panel: "contact" as Panel },
    { icon: HelpCircle, label: "Časté dotazy", panel: null as Panel },
    { icon: Shield, label: "Podmínky služby", panel: null as Panel },
    { icon: Bell, label: "Oznámení", panel: null as Panel },
    { icon: Settings, label: "Nastavení", panel: null as Panel },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),16px)] pb-5 border-b border-white/[0.06]">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06]">
          <X className="w-4 h-4 text-white/60" />
        </motion.button>
        <h2 className="text-lg font-bold text-white">Menu</h2>
      </div>
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/15 ring-1 ring-red-500/20">
            <Phone className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">SOS <span className="text-red-400">HNED</span></h3>
            <p className="text-xs text-white/40">Havarijní dispečink 24/7</p>
          </div>
        </div>
      </div>
      <div className="flex-1 py-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (item.panel) {
                onClose();
                setTimeout(() => onNavigate(item.panel), 200);
              }
            }}
            className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/[0.04] transition-colors"
          >
            <item.icon className="w-5 h-5 text-white/40" />
            <span className="text-sm font-medium text-white/70">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-white/20 ml-auto" />
          </motion.button>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <p className="text-[10px] text-white/20 text-center">SOS HNED v1.0.0 · © 2026</p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PROFILE PANEL                                                     */
/* ================================================================== */
function ProfilePanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),16px)] pb-5 border-b border-white/[0.06]">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06]">
          <X className="w-4 h-4 text-white/60" />
        </motion.button>
        <h2 className="text-lg font-bold text-white">Profil</h2>
      </div>
      <div className="flex flex-col items-center py-8 border-b border-white/[0.06]">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-white/[0.08] mb-3">
          <span className="text-2xl font-bold text-white">JN</span>
        </div>
        <h3 className="text-base font-bold text-white">Jan Novák</h3>
        <p className="text-xs text-white/40 mt-0.5">jan.novak@email.cz</p>
        <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-semibold text-emerald-400">Ověřený uživatel</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-px bg-white/[0.04] mx-5 my-5 rounded-2xl overflow-hidden ring-1 ring-white/[0.06]">
        {[{ label: "Výjezdy", value: "3" }, { label: "Uloženo", value: "2" }, { label: "Recenze", value: "1" }].map((s) => (
          <div key={s.label} className="flex flex-col items-center py-4 bg-[#0c0c14]">
            <span className="text-lg font-bold text-white">{s.value}</span>
            <span className="text-[10px] text-white/30 mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="px-5 space-y-1">
        {[
          { icon: MapPin, label: "Moje adresy" }, { icon: CreditCard, label: "Platební metody" },
          { icon: Clock, label: "Historie výjezdů" }, { icon: Heart, label: "Oblíbení partneři" },
          { icon: Bell, label: "Notifikace" }, { icon: Settings, label: "Nastavení účtu" },
        ].map((item) => (
          <motion.button key={item.label} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-colors">
            <item.icon className="w-4.5 h-4.5 text-white/35" />
            <span className="text-sm font-medium text-white/60">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-white/15 ml-auto" />
          </motion.button>
        ))}
      </div>
      <div className="mt-auto px-5 py-5 border-t border-white/[0.06]">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 ring-1 ring-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/15 transition-colors">
          <LogOut className="w-4 h-4" />
          Odhlásit se
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CONTACT PANEL                                                     */
/* ================================================================== */
function ContactPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),16px)] pb-5 border-b border-white/[0.06]">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06]">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </motion.button>
        <h2 className="text-lg font-bold text-white">Kontakt na správce</h2>
      </div>
      <div className="px-5 py-8 space-y-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/15 ring-1 ring-blue-500/20 flex items-center justify-center mb-4">
            <PhoneCall className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-white">Podpora SOS HNED</h3>
          <p className="text-xs text-white/40 mt-1 max-w-[240px]">Jsme tu pro vás 24 hodin denně, 7 dní v týdnu</p>
        </div>
        {[
          { icon: Phone, label: "Telefon", value: "+420 800 123 456", color: "bg-emerald-500/10 ring-emerald-500/20 text-emerald-400" },
          { icon: Mail, label: "E-mail", value: "podpora@soshned.cz", color: "bg-blue-500/10 ring-blue-500/20 text-blue-400" },
          { icon: MessageCircle, label: "Chat", value: "Online chat v aplikaci", color: "bg-purple-500/10 ring-purple-500/20 text-purple-400" },
          { icon: Clock, label: "Pracovní doba", value: "Non-stop 24/7", color: "bg-amber-500/10 ring-amber-500/20 text-amber-400" },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
            <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl ring-1", c.color)}>
              <c.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">{c.label}</p>
              <p className="text-sm font-semibold text-white mt-0.5">{c.value}</p>
            </div>
          </div>
        ))}
        <div className="p-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
          <p className="text-xs text-white/40 leading-relaxed">
            <span className="font-semibold text-white/60">Sídlo společnosti:</span><br />
            SOS HNED s.r.o.<br />Václavské náměstí 1, 110 00 Praha 1<br />IČO: 12345678 · DIČ: CZ12345678
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ABOUT PANEL                                                       */
/* ================================================================== */
function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),16px)] pb-5 border-b border-white/[0.06]">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06]">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </motion.button>
        <h2 className="text-lg font-bold text-white">O aplikaci</h2>
      </div>
      <div className="px-5 py-8 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500/20 to-red-600/5 ring-1 ring-red-500/20 flex items-center justify-center mb-4">
            <Phone className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-extrabold text-white">SOS <span className="text-red-400">HNED</span></h3>
          <p className="text-xs text-white/30 mt-1">Verze 1.0.0 · Sestavení 2026.03</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] space-y-3">
          <p className="text-sm text-white/60 leading-relaxed">
            <span className="font-bold text-white">SOS HNED</span> je česká mobilní aplikace pro okamžité přivolání havarijní pomoci. Propojujeme lidi v nouzi s ověřenými profesionály — zámečníky, instalatéry, odtahovkami a servisy.
          </p>
          <p className="text-sm text-white/60 leading-relaxed">
            Naším cílem je, abyste pomoc měli na dosah ruky <span className="font-semibold text-white/80">do pár minut</span>, kdykoliv a kdekoliv.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider px-1">Klíčové funkce</h4>
          {[
            { icon: Siren, text: "SOS tlačítko — přivolání pomoci jedním klikem", color: "text-red-400" },
            { icon: MapPin, text: "Živé sledování polohy technika na mapě", color: "text-blue-400" },
            { icon: Star, text: "Hodnocení a recenze od reálných zákazníků", color: "text-amber-400" },
            { icon: Shield, text: "Ověření partneři s garancí kvality", color: "text-emerald-400" },
            { icon: Clock, text: "Nonstop dispečink — 24/7, 365 dní v roce", color: "text-purple-400" },
          ].map((f) => (
            <div key={f.text} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]">
              <f.icon className={cn("w-4 h-4 mt-0.5 shrink-0", f.color)} />
              <span className="text-xs text-white/50 leading-relaxed">{f.text}</span>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
          <p className="text-[10px] text-white/25 text-center leading-relaxed">
            Vytvořeno s ❤️ v České republice<br />© 2026 SOS HNED s.r.o. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SERVICE DETAIL PANEL                                              */
/* ================================================================== */
function ServiceDetailPanel({ service, onClose }: { service: ServiceProvider | null; onClose: () => void }) {
  if (!service) return null;
  const Icon = service.icon;

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/[0.06] sticky top-0 bg-[#0c0c14] z-10">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06]">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </motion.button>
        <h2 className="text-lg font-bold text-white truncate">{service.name}</h2>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* Header card */}
        <div className="flex items-center gap-4">
          <div className={cn("flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg ring-2", service.pinBg, service.pinRing, service.pinShadow)}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">{service.name}</h3>
            <p className="text-xs text-white/40">{service.profession}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Stars rating={service.rating} />
              <span className="text-xs font-bold text-white/60">{service.rating}</span>
              <span className="text-[10px] text-white/30">({service.reviewCount} recenzí)</span>
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06]">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] text-white/30">Příjezd</p>
              <p className="text-xs font-bold text-white">{service.eta}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06]">
            <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="text-[10px] text-white/30">Cena</p>
              <p className="text-xs font-bold text-white">{service.price}</p>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06]">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-white">{service.phone}</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06]">
            <MapPin className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs font-semibold text-white">{service.address}</span>
          </div>
          <a
            href={service.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/[0.08] ring-1 ring-blue-500/20 hover:bg-blue-500/[0.12] transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs font-semibold text-blue-400">{service.website.replace("https://", "")}</span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/40 ml-auto" />
          </a>
        </div>

        {/* Description */}
        <div className="p-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
          <p className="text-sm text-white/50 leading-relaxed">{service.description}</p>
        </div>

        {/* Reviews */}
        <div>
          <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3 px-1">
            Recenze ({service.reviews.length})
          </h4>
          <div className="space-y-2.5">
            {service.reviews.map((r, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white/50">{r.author.charAt(0)}</span>
                    </div>
                    <span className="text-xs font-semibold text-white/70">{r.author}</span>
                  </div>
                  <span className="text-[10px] text-white/25">{r.date}</span>
                </div>
                <Stars rating={r.rating} size={10} />
                <p className="text-xs text-white/45 mt-2 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-extrabold text-sm tracking-wide shadow-xl animate-sos-pulse"
        >
          <span className="flex items-center justify-center gap-2">
            <Siren className="w-4 h-4" />
            PŘIVOLAT {service.profession.toUpperCase()} HNED
          </span>
        </motion.button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MAP MODE SWITCHER (floating pills)                                */
/* ================================================================== */
function MapModeSwitcher({ current, onChange }: { current: MapMode; onChange: (m: MapMode) => void }) {
  const modes: MapMode[] = ["2d", "3d", "satellite", "map"];

  return (
    <div className="flex gap-1 p-1 rounded-2xl bg-black/50 backdrop-blur-2xl ring-1 ring-white/[0.1]">
      {modes.map((m) => {
        const cfg = MAP_STYLES[m];
        const MIcon = cfg.icon;
        const active = current === m;

        return (
          <motion.button
            key={m}
            whileTap={{ scale: 0.92 }}
            onClick={() => onChange(m)}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200",
              active
                ? "text-white"
                : "text-white/40 hover:text-white/60"
            )}
          >
            {active && (
              <motion.div
                layoutId="map-mode-pill"
                className="absolute inset-0 rounded-xl bg-white/[0.12] ring-1 ring-white/[0.15]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <MIcon className="relative z-10 w-3.5 h-3.5" strokeWidth={2} />
            <span className="relative z-10">{cfg.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  PIN TOOLTIP (card that appears when clicking a pin on map)        */
/* ================================================================== */
function PinTooltip({
  service,
  onDetail,
  onClose,
}: {
  service: ServiceProvider;
  onDetail: () => void;
  onClose: () => void;
}) {
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="absolute bottom-[max(env(safe-area-inset-bottom),16px)] left-4 right-4 z-40"
    >
      <div className="p-4 rounded-2xl bg-[#0f0f1a]/95 backdrop-blur-2xl ring-1 ring-white/[0.1] shadow-2xl shadow-black/50">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors">
          <X className="w-3.5 h-3.5 text-white/40" />
        </button>

        <div className="flex items-center gap-3.5 mb-3">
          <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl shadow-lg ring-2", service.pinBg, service.pinRing)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{service.name}</h3>
            <p className="text-[10px] text-white/40">{service.profession} · {service.address}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Stars rating={service.rating} size={10} />
              <span className="text-[10px] font-bold text-white/50">{service.rating}</span>
              <span className="text-[10px] text-white/25">({service.reviewCount})</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] ring-1 ring-white/[0.06]">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-white">{service.eta}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] ring-1 ring-white/[0.06]">
            <CreditCard className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-bold text-white">{service.price}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] ring-1 ring-white/[0.06]">
            <Phone className="w-3 h-3 text-white/40" />
            <span className="text-[10px] font-bold text-white">{service.phone.slice(-9)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onDetail}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.08] ring-1 ring-white/[0.12] hover:bg-white/[0.12] transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-semibold text-white/70">Detail</span>
          </motion.button>
          <a
            href={service.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/15 ring-1 ring-blue-500/25 hover:bg-blue-500/25 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400">Web</span>
          </a>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/15 ring-1 ring-red-500/25 hover:bg-red-500/25 transition-colors"
          >
            <Siren className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-semibold text-red-400">SOS</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  SEARCH RESULTS DROPDOWN                                           */
/* ================================================================== */
function SearchResults({
  results,
  onSelect,
}: {
  results: ServiceProvider[];
  onSelect: (s: ServiceProvider) => void;
}) {
  if (results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="absolute top-full left-0 right-0 mt-1.5 z-50 max-h-[240px] overflow-y-auto rounded-2xl bg-[#0f0f1a]/98 backdrop-blur-2xl ring-1 ring-white/[0.1] shadow-2xl hide-scrollbar"
    >
      {results.map((s) => {
        const SIcon = s.icon;
        return (
          <motion.button
            key={s.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(s)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-b-0"
          >
            <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg ring-1", s.pinBg, s.pinRing)}>
              <SIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate">{s.name}</p>
              <p className="text-[10px] text-white/30">{s.profession} · {s.address}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-white/50">{s.rating}</span>
            </div>
            <Navigation className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
          </motion.button>
        );
      })}
    </motion.div>
  );
}

/* ================================================================== */
/*  MAIN PAGE COMPONENT                                               */
/* ================================================================== */

export default function HomePage() {
  const mapRef = useRef<MapRef>(null);
  const [selected, setSelected] = useState<Profession | null>(null);
  const [state, setState] = useState<AppState>("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [selectedService, setSelectedService] = useState<ServiceProvider | null>(null);
  const [tooltipService, setTooltipService] = useState<ServiceProvider | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>("satellite");

  /* ---- Derived map config ---- */
  const mapConfig = MAP_STYLES[mapMode];

  /* ---- Filtered professions ---- */
  const filteredProfessions = useMemo(() => {
    if (!searchQuery.trim()) return PROFESSIONS;
    const q = searchQuery.toLowerCase();
    return PROFESSIONS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.includes(q))
    );
  }, [searchQuery]);

  /* ---- Filtered service pins ---- */
  const visibleServices = useMemo(() => {
    if (!selected) return SERVICES;
    return SERVICES.filter((s) => s.professionId === selected.id);
  }, [selected]);

  /* ---- Search results (services matching query) ---- */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !searchFocused) return [];
    const q = searchQuery.toLowerCase();
    return SERVICES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.profession.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery, searchFocused]);

  /* ---- Fly to service on map ---- */
  const flyToService = useCallback((service: ServiceProvider) => {
    setSearchQuery("");
    setSearchFocused(false);
    setTooltipService(service);
    mapRef.current?.flyTo({
      center: [service.lng, service.lat],
      zoom: 16,
      pitch: mapConfig.pitch,
      duration: 1500,
    });
  }, [mapConfig.pitch]);

  /* ---- Change map mode ---- */
  const handleMapModeChange = useCallback((mode: MapMode) => {
    setMapMode(mode);
    const cfg = MAP_STYLES[mode];
    mapRef.current?.easeTo({ pitch: cfg.pitch, duration: 600 });
  }, []);

  /* ---- Handlers ---- */
  const handleSOS = useCallback(() => {
    if (!selected) return;
    setState("searching");
    setTimeout(() => setState("found"), 3000);
  }, [selected]);

  const handleReset = useCallback(() => {
    setState("idle");
    setSelected(null);
    setSearchQuery("");
    setTooltipService(null);
  }, []);

  const handleSelect = useCallback((p: Profession) => {
    setSelected(p);
    setState("selected");
    setSearchQuery("");
    setTooltipService(null);
  }, []);

  const handlePinClick = useCallback((service: ServiceProvider) => {
    setTooltipService(service);
    mapRef.current?.flyTo({
      center: [service.lng, service.lat],
      zoom: 15.5,
      pitch: mapConfig.pitch,
      duration: 800,
    });
  }, [mapConfig.pitch]);

  const openServiceDetail = useCallback((service: ServiceProvider) => {
    setSelectedService(service);
    setActivePanel("service");
    setTooltipService(null);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
    setSelectedService(null);
  }, []);

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  const isDarkMap = mapMode === "2d" || mapMode === "3d";

  return (
    <div className="relative flex flex-col h-full w-full select-none overflow-hidden bg-[#07070d]">
      {/* ============================================================ */}
      {/*  TOP HEADER PANEL (solid, not over map)                      */}
      {/* ============================================================ */}
      <div className="relative z-30 shrink-0 bg-[#0a0a14] border-b border-white/[0.06]">
        {/* Row 1: Menu / Logo / Profile */}
        <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),8px)] pb-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setActivePanel("menu")}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.06] ring-1 ring-white/[0.08]"
          >
            <Menu className="w-5 h-5 text-white/80" />
          </motion.button>

          <div className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-red-400" strokeWidth={2.5} />
            <h1 className="text-base font-extrabold tracking-tight text-white">
              SOS<span className="text-red-400"> HNED</span>
            </h1>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setActivePanel("profile")}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.06] ring-1 ring-white/[0.08]"
          >
            <User className="w-5 h-5 text-white/80" />
          </motion.button>
        </div>

        {/* Row 2: Search bar */}
        <div className="relative px-4 pb-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Hledat službu, firmu, adresu…"
              disabled={state === "searching" || state === "found"}
              className={cn(
                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-white placeholder:text-white/25",
                "bg-white/[0.05] ring-1 ring-white/[0.08]",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all",
                (state === "searching" || state === "found") && "opacity-50 pointer-events-none"
              )}
            />
            {/* Search dropdown */}
            <AnimatePresence>
              {searchFocused && searchResults.length > 0 && (
                <SearchResults results={searchResults} onSelect={flyToService} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 3: Category strip */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {filteredProfessions.map((p) => {
            const PIcon = p.icon;
            const isActive = selected?.id === p.id;
            const isDisabled = state === "searching" || state === "found";

            return (
              <motion.button
                key={p.id}
                whileTap={isDisabled ? {} : { scale: 0.93 }}
                onClick={() => !isDisabled && handleSelect(p)}
                disabled={isDisabled}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap shrink-0",
                  isDisabled && !isActive && "opacity-40 pointer-events-none",
                  isActive
                    ? `bg-gradient-to-r ${p.gradient} border-transparent ring-2 ${p.color} shadow-lg ${p.glowColor}`
                    : "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08]"
                )}
              >
                <PIcon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-white" : "text-white/40"
                  )}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                <span
                  className={cn(
                    "text-[11px] font-semibold transition-colors",
                    isActive ? "text-white" : "text-white/40"
                  )}
                >
                  {p.label}
                </span>
              </motion.button>
            );
          })}

          {filteredProfessions.length === 0 && (
            <p className="text-xs text-white/30 py-2 px-1">
              Žádný výsledek pro &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  MAP AREA (fills remaining space)                            */}
      {/* ============================================================ */}
      <div className="relative flex-1 z-0">
        <Map
          ref={mapRef}
          initialViewState={{
            ...CUSTOMER_COORDS,
            zoom: 13.5,
            pitch: mapConfig.pitch,
          }}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle={mapConfig.style}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
          logoPosition="bottom-left"
          interactive={true}
          dragRotate={mapMode === "3d" || mapMode === "satellite"}
          onClick={() => setTooltipService(null)}
        >
          {/* Customer Marker */}
          <Marker {...CUSTOMER_COORDS} anchor="center">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-7 h-7 rounded-full bg-blue-400/25 animate-pulse-ring-outer" />
              <span className="absolute w-7 h-7 rounded-full bg-blue-400/35 animate-pulse-ring" />
              <span className="relative w-4.5 h-4.5 rounded-full bg-blue-500 ring-[3px] ring-white/40 shadow-[0_0_24px_rgba(59,130,246,0.7)]" />
            </div>
          </Marker>

          {/* Service Provider Pins */}
          {visibleServices.map((svc) => {
            const PinIcon = svc.icon;
            const isHighlighted = tooltipService?.id === svc.id;
            return (
              <Marker
                key={svc.id}
                latitude={svc.lat}
                longitude={svc.lng}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handlePinClick(svc);
                }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isHighlighted ? 1.25 : 1,
                    opacity: 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full shadow-lg ring-2 transition-all duration-200",
                    isHighlighted ? "ring-white/60 scale-110" : "ring-white/30",
                    svc.pinBg, svc.pinShadow
                  )}>
                    <PinIcon className="w-4 h-4 text-white" strokeWidth={2.2} />
                  </div>
                  <div className={cn(
                    "w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent -mt-[1px]",
                    isHighlighted ? "border-t-white/60" : "border-t-white/30"
                  )} />
                  {/* Mini label on hover/selected */}
                  {isHighlighted && (
                    <motion.div
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-0.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm"
                    >
                      <span className="text-[9px] font-bold text-white whitespace-nowrap">{svc.name}</span>
                    </motion.div>
                  )}
                </motion.div>
              </Marker>
            );
          })}

          {/* Tech approaching marker */}
          <AnimatePresence>
            {state === "found" && selected && (
              <Marker {...TECH_COORDS} anchor="bottom">
                <motion.div
                  initial={{ opacity: 0, scale: 0.3, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.3 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
                  className="flex flex-col items-center animate-marker-bounce"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 ring-3 ring-emerald-400/50">
                    <Truck className="w-5 h-5 text-white" strokeWidth={2.2} />
                  </div>
                  <div className="mt-1 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm ring-1 ring-emerald-500/30">
                    <span className="text-[10px] font-bold text-emerald-400">
                      {selected.techPerson} · {selected.eta}
                    </span>
                  </div>
                  <div className="w-0.5 h-3 bg-emerald-500/60 -mt-0.5" />
                </motion.div>
              </Marker>
            )}
          </AnimatePresence>
        </Map>

        {/* ---- Map Mode Switcher (floating over map, top-right) ---- */}
        <div className="absolute top-3 right-3 z-20">
          <MapModeSwitcher current={mapMode} onChange={handleMapModeChange} />
        </div>

        {/* ---- Gradient overlays on map ---- */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* ---- Pin Tooltip Card (above bottom SOS panel) ---- */}
        <AnimatePresence>
          {tooltipService && !activePanel && state !== "searching" && state !== "found" && (
            <PinTooltip
              service={tooltipService}
              onDetail={() => openServiceDetail(tooltipService)}
              onClose={() => setTooltipService(null)}
            />
          )}
        </AnimatePresence>

        {/* ---- SOS Panel (bottom, inside map area) ---- */}
        {!tooltipService && (
          <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
            <AnimatePresence mode="wait">
              {/* STATE A: Idle */}
              {state === "idle" && !selected && (
                <motion.div key="idle" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.3 }}>
                  <div className="p-4 rounded-3xl bg-black/50 backdrop-blur-2xl ring-1 ring-white/[0.08]">
                    <button disabled className="w-full py-4 rounded-2xl bg-white/[0.05] text-white/25 font-semibold text-sm cursor-not-allowed">
                      ☝️ Nejprve vyberte kategorii nebo hledejte
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STATE B: Selected */}
              {state === "selected" && selected && (
                <motion.div key="selected" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.3 }}>
                  <div className="p-4 rounded-3xl bg-black/50 backdrop-blur-2xl ring-1 ring-red-500/20">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-xs font-medium text-white/40">Vybraná služba</span>
                      <span className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                        {(() => { const SI = selected.icon; return <SI className="w-3.5 h-3.5" />; })()}
                        {selected.label}
                      </span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSOS}
                      className="relative w-full py-5 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-extrabold text-base tracking-wide shadow-2xl animate-sos-pulse overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <Siren className="w-5 h-5" />
                        PŘIVOLAT {selected.label.toUpperCase()} HNED
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* STATE C: Searching */}
              {state === "searching" && (
                <motion.div key="searching" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.35 }}>
                  <div className="p-5 rounded-3xl bg-black/50 backdrop-blur-2xl ring-1 ring-amber-500/20">
                    <div className="flex flex-col items-center gap-3">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Loader2 className="w-8 h-8 text-amber-400" />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">Hledám nejbližšího profíka v okolí…</p>
                        <p className="text-xs text-white/40 mt-1">Kontroluji dostupnost a vzdálenost</p>
                      </div>
                      <div className="w-full h-1 rounded-full bg-white/[0.08] overflow-hidden mt-1">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STATE D: Found */}
              {state === "found" && selected && (
                <motion.div key="found" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.4 }}>
                  <div className="p-4 rounded-3xl bg-black/50 backdrop-blur-2xl ring-1 ring-emerald-500/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-emerald-400">Záchrana je na cestě!</p>
                        <p className="text-xs text-white/50 mt-0.5 truncate">
                          {selected.techPerson} ({selected.techName}) přijal výjezd
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.05] ring-1 ring-white/[0.08]">
                        <Clock className="w-4 h-4 text-white/30 shrink-0" />
                        <div>
                          <p className="text-[10px] text-white/30 leading-none">Příjezd</p>
                          <p className="text-xs font-bold text-white mt-0.5">{selected.eta}</p>
                        </div>
                      </div>
                      <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.05] ring-1 ring-white/[0.08]">
                        <Phone className="w-4 h-4 text-white/30 shrink-0" />
                        <div>
                          <p className="text-[10px] text-white/30 leading-none">Kontakt</p>
                          <p className="text-xs font-bold text-white mt-0.5">+420 *** ***</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 px-3 py-2 mb-3 rounded-xl bg-emerald-500/[0.08] ring-1 ring-emerald-500/20">
                      <span className="text-xs font-medium text-emerald-400/80">📍 Sledujte polohu na mapě v reálném čase</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleReset}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] ring-1 ring-white/[0.1] hover:bg-white/[0.08] transition-colors"
                    >
                      <X className="w-4 h-4 text-white/40" />
                      <span className="text-xs font-semibold text-white/40">Zrušit výjezd / Zpět</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  SLIDE PANELS                                                */}
      {/* ============================================================ */}
      <SlidePanel isOpen={activePanel === "menu"} onClose={closePanel} direction="left">
        <MenuPanel onClose={closePanel} onNavigate={setActivePanel} />
      </SlidePanel>
      <SlidePanel isOpen={activePanel === "profile"} onClose={closePanel} direction="right">
        <ProfilePanel onClose={closePanel} />
      </SlidePanel>
      <SlidePanel isOpen={activePanel === "service"} onClose={closePanel} direction="bottom">
        <ServiceDetailPanel service={selectedService} onClose={closePanel} />
      </SlidePanel>
      <SlidePanel isOpen={activePanel === "contact"} onClose={closePanel} direction="left">
        <ContactPanel onClose={closePanel} />
      </SlidePanel>
      <SlidePanel isOpen={activePanel === "about"} onClose={closePanel} direction="left">
        <AboutPanel onClose={closePanel} />
      </SlidePanel>
    </div>
  );
}
