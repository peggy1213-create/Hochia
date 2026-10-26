// Taiwan's 22 counties/cities. Districts are seeded for Taipei (sample);
// the full township list is loaded from data in a later phase.

export type District = { zh: string; en: string };
export type County = { zh: string; en: string; districts?: District[] };

export const COUNTIES: County[] = [
  { zh: '基隆市', en: 'Keelung' },
  {
    zh: '臺北市',
    en: 'Taipei',
    districts: [
      { zh: '松山區', en: 'Songshan' },
      { zh: '大安區', en: "Da'an" },
      { zh: '信義區', en: 'Xinyi' },
      { zh: '中正區', en: 'Zhongzheng' },
      { zh: '士林區', en: 'Shilin' },
    ],
  },
  { zh: '新北市', en: 'New Taipei' },
  { zh: '桃園市', en: 'Taoyuan' },
  { zh: '新竹市', en: 'Hsinchu City' },
  { zh: '新竹縣', en: 'Hsinchu County' },
  { zh: '苗栗縣', en: 'Miaoli' },
  { zh: '臺中市', en: 'Taichung' },
  { zh: '彰化縣', en: 'Changhua' },
  { zh: '南投縣', en: 'Nantou' },
  { zh: '雲林縣', en: 'Yunlin' },
  { zh: '嘉義市', en: 'Chiayi City' },
  { zh: '嘉義縣', en: 'Chiayi County' },
  { zh: '臺南市', en: 'Tainan' },
  { zh: '高雄市', en: 'Kaohsiung' },
  { zh: '屏東縣', en: 'Pingtung' },
  { zh: '宜蘭縣', en: 'Yilan' },
  { zh: '花蓮縣', en: 'Hualien' },
  { zh: '臺東縣', en: 'Taitung' },
  { zh: '澎湖縣', en: 'Penghu' },
  { zh: '金門縣', en: 'Kinmen' },
  { zh: '連江縣', en: 'Lienchiang' },
];

export const DEFAULT_COUNTY_ZH = '臺北市';

export function findCounty(zh: string | undefined): County | undefined {
  return COUNTIES.find((c) => c.zh === zh);
}

export function countyLabel(county: County, locale: string): string {
  return locale === 'en' ? county.en : county.zh;
}
