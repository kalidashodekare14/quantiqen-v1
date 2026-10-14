import { RequireRole } from "@/components/auth/RequireRole";
import { routes } from "@/constants/routes";
import ViewApiManagement from "@/features/api-management/view-api-management";

const page = () => {
  return (
    <RequireRole allowedRoles={["CUSTOMER_ADMIN"]} redirect={routes.dashboard}>
      <ViewApiManagement />
    </RequireRole>
  );
};

export default page;
