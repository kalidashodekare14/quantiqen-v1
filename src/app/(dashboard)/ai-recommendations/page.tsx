import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";

const page = () => {
  redirect(routes.dashboard);
};

export default page;
