import { jsPDF } from "jspdf";
import { TFunction } from "i18next";
import { GameSystem, Faction, UnitWithItem } from "../types/types";

export const exportPdf = (
  t: TFunction,
  armyName: string,
  game: GameSystem | null,
  faction: Faction | null,
  selectedUnits: UnitWithItem[],
  totalPoints: number,
  totalCount: number,
  validateDynamic: () => string[]
) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`${t("pdfArmy")} ${armyName || t("pdfUnnamed")}`, 10, 20);

  doc.setFontSize(12);
  doc.text(`${t("pdfGame")} ${game?.name || "-"}`, 10, 30);
  doc.text(
    `${t("pdfFaction")} ${faction?.displayName || faction?.name || "-"}`,
    10,
    37
  );
  doc.text(`${t("pdfPoints")} ${totalPoints}`, 10, 44);
  doc.text(`${t("pdfUnits")} ${totalCount}`, 10, 51);

  let y = 60;

  if (faction?.image) {
    const img = new Image();
    img.src = `/assets/factions/${faction.image}`;
    doc.addImage(img, "JPEG", 150, 15, 40, 40);
  }

  if (faction?.armyRules?.length) {
    doc.setFontSize(12);
    doc.text("🛡️ Regole della fazione:", 10, y);
    y += 6;
    faction.armyRules.forEach((r) => {
      doc.text(`• ${r.name}: ${r.rules}`, 12, y);
      y += 6;
    });
    y += 4;
  }

  if (faction?.armySpells?.length) {
    doc.text("Incantesimi disponibili:", 10, y);
    y += 6;

    faction.armySpells.forEach((s) => {
      const spellLine = `• ${s.name} — ${s.effect} (Range: ${s.rangeInCm}cm | Diff: ${s.difficultyToCast})`;
      const wrapped = doc.splitTextToSize(spellLine, 150);
      doc.text(wrapped, 12, y);
      y += 7;

      if (s.flavourText) {
        const spellFlavourText = `“${s.flavourText}”`;
        const wrappedFlavour = doc.splitTextToSize(spellFlavourText, 200);

        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(wrappedFlavour, 14, y);
        y += 5;
        doc.setFontSize(12);
        doc.setTextColor(0);
      }

       y += 7;
    });

    y += 4;
  }

  doc.text(t("pdfUnitsSelected"), 10, y);
  y += 7;

  selectedUnits.forEach((u) => {
    const basePts = u.pointsPerUnit ?? 0;
    const item = u.items?.[0];
    const itemData = item
      ? game?.items?.find((i) => i.id === item.itemId)
      : null;
    const itemText = itemData
      ? ` + ${itemData.name} (${itemData.cost.amount} Pti)`
      : "";
    const total = basePts + (itemData?.cost.amount ?? 0);

    doc.text(`1x ${u.name}${itemText} = ${total} Pti`, 12, y);
    y += 6;

    const unitRules = u.rules
      ?.map((ruleName) => faction?.unitRules?.find((r) => r.name === ruleName))
      .filter(Boolean);
    unitRules?.forEach((r) => {
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`› ${r?.name}: ${r?.gameRules}`, 14, y);
      y += 5;
      doc.setFontSize(12);
      doc.setTextColor(0);
    });
  });

  const violations = validateDynamic();
  if (violations.length > 0) {
    y += 6;
    doc.setTextColor(200, 0, 0);
    doc.text(t("pdfViolation"), 10, y);
    y += 6;
    violations.forEach((v) => {
      doc.text(`• ${v}`, 12, y);
      y += 6;
    });
    doc.setTextColor(0, 0, 0);
  }

  doc.save(`${armyName || "army-list"}.pdf`);
};
