import { NotFoundState } from "@/components/custom/NotFoundState";

// Runs as the not-found payload is applied, including when Next serves the
// minimal error document instead of this layout's <html>.
const SET_LANG = `document.documentElement.lang=(location.pathname.split("/")[1]==="lv"?"lv":"en");`;

export default function NotFound() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SET_LANG }} />
      <NotFoundState />
    </>
  );
}
