import type { Icon } from "@phosphor-icons/react";
import {
  Compass,
  Briefcase,
  Books,
  LinkedinLogo,
  ThreadsLogo,
  XLogo,
  EnvelopeSimple,
  InstagramLogo,
  GlobeSimple,
  YoutubeLogo,
  GithubLogo,
} from "@phosphor-icons/react/dist/ssr";

export const iconMap: Record<string, Icon> = {
  Compass,
  Briefcase,
  Books,
  LinkedinLogo,
  ThreadsLogo,
  XLogo,
  EnvelopeSimple,
  InstagramLogo,
  GlobeSimple,
  YoutubeLogo,
  GithubLogo,
};

export function resolveIcon(name?: string): Icon {
  return (name && iconMap[name]) || GlobeSimple;
}
