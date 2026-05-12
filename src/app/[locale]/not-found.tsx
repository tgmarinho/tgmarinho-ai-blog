import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-blue-500 mb-4">{t("code")}</h1>
      <h2 className="text-2xl font-semibold mb-2">{t("title")}</h2>
      <p className="text-muted-foreground mb-8">{t("description")}</p>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          {t("back")}
        </Link>
      </Button>
    </div>
  );
}
