"use client";

import { FABRIC_CHARACTER_KEYS } from "@/lib/fabric/character";
import { ADMIN_COPY } from "@/lib/admin/copy";
import {
  adminField,
  adminInput,
  adminLabel,
  adminMuted,
  adminSectionTitle,
} from "@/lib/admin/ui";
import type { FabricCharacter, FabricCharacterKey } from "@/lib/fabric/character";

type FabricCharacterFieldsProps = {
  value: FabricCharacter;
  onChange: (character: FabricCharacter) => void;
};

const FIELD_LABELS: Record<FabricCharacterKey, string> = {
  thickness: ADMIN_COPY.fabrics.fields.characterThickness,
  softness: ADMIN_COPY.fabrics.fields.characterSoftness,
  structure: ADMIN_COPY.fabrics.fields.characterStructure,
  sheerness: ADMIN_COPY.fabrics.fields.characterSheerness,
  surface: ADMIN_COPY.fabrics.fields.characterSurface,
};

export function FabricCharacterFields({
  value,
  onChange,
}: FabricCharacterFieldsProps) {
  const copy = ADMIN_COPY.fabrics.fields;

  return (
    <fieldset className="space-y-4">
      <legend className={adminSectionTitle}>{copy.character}</legend>
      <p className={adminMuted}>各項目 1（低）〜 5（高）</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {FABRIC_CHARACTER_KEYS.map((key) => (
          <label key={key} className={adminField}>
            <span className={adminLabel}>{FIELD_LABELS[key]}</span>
            <input
              type="number"
              min={1}
              max={5}
              step={1}
              value={value[key]}
              onChange={(event) =>
                onChange({
                  ...value,
                  [key]: Number(event.target.value) as FabricCharacter[typeof key],
                })
              }
              className={`${adminInput} max-w-[6rem]`}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
