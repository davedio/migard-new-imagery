import Image from "next/image";
import type { EcosystemPartner } from "@/lib/ecosystemPartners";

const isSvgLogo = (logo: string) => logo.endsWith(".svg");

function getRowSizes(count: number) {
  if (count <= 4) return [count];
  if (count <= 7) return [3, count - 3];
  const rows = [3, 4];
  let remaining = count - 7;
  while (remaining > 0) {
    rows.push(Math.min(4, remaining));
    remaining -= 4;
  }
  return rows;
}

function chunkPartners(partners: readonly EcosystemPartner[]) {
  const rowSizes = getRowSizes(partners.length);
  let cursor = 0;

  return rowSizes.map((size) => {
    const row = partners.slice(cursor, cursor + size);
    cursor += size;
    return row;
  });
}

export function MagneticPartnerBoard({ partners }: { partners: readonly EcosystemPartner[] }) {
  const rows = chunkPartners(partners);

  return (
    <div className="partner-magnet-board">
      <div className="partner-magnet-board__grid" aria-label="Ecosystem partner logos" role="list">
        {rows.map((row, rowIndex) => (
          <div
            className="partner-magnet-row"
            data-count={row.length}
            data-row={rowIndex + 1}
            key={row.map((partner) => partner.name).join("-")}
          >
            {row.map((partner, index) => (
              <div
                className="partner-magnet-card"
                data-logo-shape={partner.logoShape ?? "wide"}
                data-slot={index + 1}
                data-tone={partner.tone}
                key={partner.name}
                role="listitem"
              >
                <span className="partner-magnet-card__logo" aria-hidden="true">
                  <Image
                    src={partner.logo}
                    alt=""
                    width={partner.width}
                    height={partner.height}
                    loading="eager"
                    sizes="180px"
                    unoptimized={isSvgLogo(partner.logo)}
                  />
                </span>
                <span className="partner-magnet-card__name">{partner.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
