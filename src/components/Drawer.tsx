import React from "react";

type DrawerProps = {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function Drawer({ children, isOpen, setIsOpen }: DrawerProps) {
  return (
    <main
      className={
        " fixed overflow-hidden z-50 inset-0 bg-slate-950/60 backdrop-blur-[1px] transform ease-in-out " +
        (isOpen
          ? " transition-opacity opacity-100 duration-500 translate-x-0  "
          : " transition-all delay-500 opacity-0 translate-x-full  ")
      }
    >
      <section
        className={
          " w-screen max-w-lg right-0 absolute h-full border-l border-slate-700 bg-slate-900 shadow-2xl delay-400 duration-500 ease-in-out transition-all transform  " +
          (isOpen ? " translate-x-0 " : " translate-x-full ")
        }
      >
        <article className="relative w-screen max-w-lg pb-10 flex h-full flex-col space-y-6 overflow-y-scroll text-slate-100">
          {children}
        </article>
      </section>
      <section
        className="w-screen h-full cursor-pointer"
        onClick={() => {
          setIsOpen(false);
        }}
      ></section>
    </main>
  );
}
