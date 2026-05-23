"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useRef } from "react";

/**
 * Mantém o conteúdo da página anterior visível durante o exit animation.
 * Sem isto, o App Router troca o children de imediato e o fade fica a piscar.
 */
function FrozenRouter({
  children,
  routeKey,
}: {
  children: React.ReactNode;
  routeKey: string;
}) {
  const context = useContext(LayoutRouterContext);
  const pathname = usePathname();
  const frozen = useRef(context);

  // Mesma rota (ex.: refresh após server action) → contexto atualizado.
  // Navegação → instância em exit mantém o contexto congelado.
  if (pathname === routeKey) {
    frozen.current = context;
  }

  return (
    <LayoutRouterContext.Provider value={frozen.current}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (reduceMotion) {
    return <div className="min-h-0 flex-1">{children}</div>;
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-x-clip">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={pathname}
          variants={fade}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <FrozenRouter routeKey={pathname}>{children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
