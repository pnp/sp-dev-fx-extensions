import * as React from "react";
import { useEffect, useState } from 'react';


export default function usePageNavigator(startNode?: React.ReactNode): { selectedPage: React.ReactNode, navigateTo: (navigationNode: React.ReactNode) => void } {
  const [page, setPage] = useState(startNode);

  function navigateTo(navigationNode: React.ReactNode): void {
    setPage(navigationNode);
  }

  useEffect(() => {
    navigateTo(startNode);
  }, []);

  return { selectedPage: page, navigateTo };
}