export type MandalMapRef = {
  slug: string;
  listedName: string;
  villagemapUrl: string;
  embedUrl: string;
  largerUrl: string;
};

export function kurnoolHybridMap(placeQuery: string): Pick<MandalMapRef, "embedUrl" | "largerUrl"> {
  const q = encodeURIComponent(`${placeQuery} Kurnool Andhra Pradesh`);
  const hq = encodeURIComponent(placeQuery);
  return {
    embedUrl: `https://maps.google.co.in/maps?f=q&source=s_q&hl=en&geocode=&q=${q}&t=h&ie=UTF8&hq=${hq}&hnear=Kurnool+Andhra+Pradesh&output=embed&iwloc=near`,
    largerUrl: `https://maps.google.co.in/maps?f=q&source=embed&hl=en&geocode=&q=${q}&t=h&ie=UTF8&hq=${hq}&hnear=Kurnool+Andhra+Pradesh`,
  };
}
