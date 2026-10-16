import React from "react";

const code39 = { "0":"nnnwwnwnn", "1":"wnnwnnnnw", "2":"nnwwnnnnw", "3":"wnwwnnnnn", "4":"nnnwwnnnw", "5":"wnnwwnnnn", "6":"nnwwwnnnn", "7":"nnnwnnwnw", "8":"wnnwnnwnn", "9":"nnwwnnwnn", "*":"nwnnwnwnn" };

export default function CashBarcode({ value }) {
  const normalizedValue = String(value || "");
  if (!/^\d{8}$/.test(normalizedValue)) return null;
  const characters = `*${normalizedValue}*`;
  const units = characters.split("").flatMap((character, index) => [...code39[character]].concat(index === characters.length - 1 ? [] : ["n"]));
  let x = 12;
  const bars = units.map((unit, index) => {
    const width = unit === "w" ? 3 : 1;
    const bar = index % 2 === 0 ? <rect key={index} x={x} y="8" width={width} height="62" fill="#10284b" /> : null;
    x += width + 1;
    return bar;
  });
  return <div className="cash-barcode" aria-label={`Cash payment barcode ${normalizedValue}`}><svg viewBox={`0 0 ${x + 12} 88`} role="img">{bars}<text x={(x + 12) / 2} y="83" textAnchor="middle">{normalizedValue}</text></svg></div>;
}
