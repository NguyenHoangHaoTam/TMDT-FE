import React, { useMemo } from "react";
import ComboImgWithText from "../card-img-with-text";
import { useCategories } from "@/hook/category/use-category";
import { useNavigate } from "react-router-dom";
import { useProdByCategory } from "@/hook/home/use-home";

const CATEGORY_IMAGE_OVERRIDES_BY_ID: Record<string, string> = {};
const CATEGORY_IMAGE_OVERRIDES_BY_NAME: Record<string, string> = {};

function slugifyForFileName(input: string): string {
  const slug = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return slug || "unnamed";
}

// List of available images in public/assets/custom/
// These images are served directly from public folder
const CUSTOM_IMAGE_FILES = [
  "ao-khoac-non-gang-tay.png",
  "ba-lo-tui-chong-nuoc.png",
  "bep-gas-mini-bep-con.png",
  "en-pin-o-ien.png",
  "ghe-ban-da-ngoai.png",
  "giay-dep-du-lich.png",
  "hop-bao-quan-ly-tach.png",
  "leu-trai-mai-che.png",
  "o-nuong-bbq.png",
  "o-uong.png",
  "tui-a-hop-lanh.png",
  "tui-ngu-tham-goi-hoi.png",
];

function extractSlugFromFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.(png|jpe?g|webp)$/i, "");
  return withoutExt;
}

// Create mapping from slug to public asset path
const CUSTOM_IMAGES_BY_SLUG: Record<string, string> = CUSTOM_IMAGE_FILES.reduce(
  (acc, fileName) => {
    const slug = extractSlugFromFileName(fileName);
    acc[slug] = `/assets/custom/${fileName}`;
    return acc;
  },
  {} as Record<string, string>
);

const FEATURED_CATEGORY_KEYWORDS = [
  "đèn pin",
  "bếp",
  "lều",
  "bàn",
  "ghế",
  "túi ngủ",
  "balo",
  "giày",
] as const;

const EXCLUDED_CATEGORY_KEYWORDS = [
  "nồi",
  "chảo",
  "dao",
  "đũa",
  "bát",
  "dĩa",
  "đồ ăn",
  "thực phẩm",
  "giữ lạnh",
] as const;

function getImageForCategory(name: string, id?: string | number): string {
  if (id !== undefined) {
    const byId = CATEGORY_IMAGE_OVERRIDES_BY_ID[String(id)];
    if (byId) return byId;
  }

  if (CATEGORY_IMAGE_OVERRIDES_BY_NAME[name]) {
    return CATEGORY_IMAGE_OVERRIDES_BY_NAME[name];
  }

  // Try exact slug match first
  const nameSlug = slugifyForFileName(name);
  const autoUrl = CUSTOM_IMAGES_BY_SLUG[nameSlug];
  if (autoUrl) {
    return autoUrl;
  }

  // Try partial match - check if any image slug is contained in category name slug
  const nameSlugLower = nameSlug.toLowerCase();
  for (const [slug, url] of Object.entries(CUSTOM_IMAGES_BY_SLUG)) {
    if (nameSlugLower.includes(slug) || slug.includes(nameSlugLower)) {
      return url;
    }
  }

  // Try keyword-based matching for common categories
  const nameLower = name.toLowerCase();
  if (nameLower.includes("bếp") || nameLower.includes("bep")) {
    const bepUrl = CUSTOM_IMAGES_BY_SLUG["bep-gas-mini-bep-con"];
    if (bepUrl) return bepUrl;
  }
  if (nameLower.includes("lều") || nameLower.includes("leu") || nameLower.includes("mái che") || nameLower.includes("mai-che")) {
    const leuUrl = CUSTOM_IMAGES_BY_SLUG["leu-trai-mai-che"];
    if (leuUrl) return leuUrl;
  }
  if (nameLower.includes("ghế") || nameLower.includes("ghe") || nameLower.includes("bàn") || nameLower.includes("ban")) {
    const gheUrl = CUSTOM_IMAGES_BY_SLUG["ghe-ban-da-ngoai"];
    if (gheUrl) return gheUrl;
  }
  if (nameLower.includes("túi ngủ") || nameLower.includes("tui-ngu") || nameLower.includes("thảm") || nameLower.includes("tham") || nameLower.includes("gối") || nameLower.includes("goi")) {
    const tuiNguUrl = CUSTOM_IMAGES_BY_SLUG["tui-ngu-tham-goi-hoi"];
    if (tuiNguUrl) return tuiNguUrl;
  }
  if (nameLower.includes("giày") || nameLower.includes("giay") || nameLower.includes("dép") || nameLower.includes("dep") || nameLower.includes("du lịch") || nameLower.includes("du-lich")) {
    const giayUrl = CUSTOM_IMAGES_BY_SLUG["giay-dep-du-lich"];
    if (giayUrl) return giayUrl;
  }
  if (nameLower.includes("đèn") || nameLower.includes("den") || nameLower.includes("pin") || nameLower.includes("đồ điện") || nameLower.includes("do-dien")) {
    const denUrl = CUSTOM_IMAGES_BY_SLUG["en-pin-o-ien"];
    if (denUrl) return denUrl;
  }
  if (nameLower.includes("balo") || nameLower.includes("ba lo") || nameLower.includes("túi") || nameLower.includes("tui")) {
    const baloUrl = CUSTOM_IMAGES_BY_SLUG["ba-lo-tui-chong-nuoc"];
    if (baloUrl) return baloUrl;
  }
  if (nameLower.includes("áo") || nameLower.includes("ao") || nameLower.includes("khoác") || nameLower.includes("khoac")) {
    const aoUrl = CUSTOM_IMAGES_BY_SLUG["ao-khoac-non-gang-tay"];
    if (aoUrl) return aoUrl;
  }
  if (nameLower.includes("nướng") || nameLower.includes("nuong") || nameLower.includes("bbq")) {
    const nuongUrl = CUSTOM_IMAGES_BY_SLUG["o-nuong-bbq"];
    if (nuongUrl) return nuongUrl;
  }
  if (nameLower.includes("uống") || nameLower.includes("uong") || nameLower.includes("đồ uống") || nameLower.includes("do-uong")) {
    const uongUrl = CUSTOM_IMAGES_BY_SLUG["o-uong"];
    if (uongUrl) return uongUrl;
  }
  if (nameLower.includes("túi") && (nameLower.includes("lạnh") || nameLower.includes("lanh") || nameLower.includes("a"))) {
    const tuiLanhUrl = CUSTOM_IMAGES_BY_SLUG["tui-a-hop-lanh"];
    if (tuiLanhUrl) return tuiLanhUrl;
  }

  return "/assets/img/img-placeholder.png";
}

const ProdFeatured = ({ isPending }: { isPending?: boolean }) => {
  const { rootCategories, isPending: loadingCategories } = useCategories();
  const navigate = useNavigate();

  const childCategories = useMemo(() => {
    const roots = rootCategories || [];
    return roots.flatMap((c) => c.children || []);
  }, [rootCategories]);

  const childIds = useMemo(
    () => childCategories.map((c) => String(c.id)),
    [childCategories]
  );
  const results = useProdByCategory(childIds);

  const featured = useMemo(() => {
    if (!childCategories.length) return [];

    const categoriesWithData = childCategories.filter((_cat, idx) => {
      const r = results[idx];
      if (!r || r.isPending || r.isError) return false;
      const data = r.data as unknown as Array<unknown> | undefined;
      return Array.isArray(data) && data.length > 0;
    });

    const isExcluded = (name: string) =>
      EXCLUDED_CATEGORY_KEYWORDS.some((kw) =>
        name.toLowerCase().includes(kw.toLowerCase())
      );

    const nonFood = categoriesWithData.filter((c) => !isExcluded(c.name));
    const food = categoriesWithData.filter((c) => isExcluded(c.name));

    const byPreference: Array<{ id: string | number; name: string }> = [];
    const remaining = [...nonFood];

    for (const kw of FEATURED_CATEGORY_KEYWORDS) {
      const idx = remaining.findIndex((c) =>
        c.name.toLowerCase().includes(kw.toLowerCase())
      );
      if (idx !== -1) {
        byPreference.push(remaining[idx]);
        remaining.splice(idx, 1);
      }
      if (byPreference.length >= 12) break;
    }

    for (const c of remaining) {
      if (byPreference.length >= 12) break;
      byPreference.push(c);
    }

    for (const c of food) {
      if (byPreference.length >= 12) break;
      byPreference.push(c);
    }

    if (byPreference.length < 12) {
      const selectedIds = new Set(byPreference.map((c) => String(c.id)));
      for (const c of childCategories) {
        if (byPreference.length >= 12) break;
        if (!selectedIds.has(String(c.id))) {
          if (!isExcluded(c.name)) {
            byPreference.push(c);
            selectedIds.add(String(c.id));
          }
        }
      }
      if (byPreference.length < 12) {
        const selectedIds2 = new Set(byPreference.map((c) => String(c.id)));
        for (const c of childCategories) {
          if (byPreference.length >= 12) break;
          if (!selectedIds2.has(String(c.id)) && isExcluded(c.name)) {
            byPreference.push(c);
          }
        }
      }
    }

    return byPreference.map((c) => ({
      id: c.id,
      title: c.name,
      image: getImageForCategory(c.name, c.id),
    }));
  }, [childCategories, results]);

  if (isPending || loadingCategories) {
    return (
      <div className="grid grid-cols-12 gap-6 animate-pulse">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="col-span-2">
            <div className="flex flex-col gap-3">
              <div className="w-full aspect-square bg-gray-200 rounded-xl" />
              <div className="w-3/4 h-4 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <React.Fragment>
      <p className="uppercase font-semibold text-center text-3xl mb-4">
        Danh mục nổi bật
      </p>

      <div className="grid grid-cols-12 gap-6">
        {featured.map((item) => (
          <div key={item.id} className="col-span-2">
            <ComboImgWithText
              src={item.image}
              title={item.title}
              onClick={() => navigate(`/products?category=${item.id}`)}
            />
          </div>
        ))}
      </div>
    </React.Fragment>
  );
};

export default ProdFeatured;
