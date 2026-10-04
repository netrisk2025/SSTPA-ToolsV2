import { useEffect, useState } from "react";
import type { DiagramTheme } from "./domain/presentation/colors";

export function useGsnTheme(): DiagramTheme {
  const read=():DiagramTheme=>document.documentElement.dataset.sstpaStyle==="nocturne"?"dark":"light";
  const [theme,setTheme]=useState(read);
  useEffect(()=>{const observer=new MutationObserver(()=>setTheme(read()));observer.observe(document.documentElement,{attributes:true,attributeFilter:["data-sstpa-style"]});return()=>observer.disconnect();},[]);
  return theme;
}
