// ============================================================
// MAKARIOVS & MATIÈRE — Brand Typography Definitions
// Display: Cormorant Garamond / Trajan Display
// Script: Pinyon Script / Italianno
// Body: EB Garamond / Georgia
// Arabic: Amiri / Noto Naskh
// ============================================================

export const fontVariables = 'font-brand-tokens';

export const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Sans+Arabic:wght@300;400;500&family=Pinyon+Script&display=swap');

  :root {
    --font-cormorant: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
    --font-pinyon: 'Pinyon Script', 'Italianno', cursive, serif;
    --font-eb-garamond: 'EB Garamond', Georgia, serif;
    --font-amiri: 'Amiri', 'Times New Roman', serif;
    --font-ibm-plex-arabic: 'IBM Plex Sans Arabic', system-ui, sans-serif;
  }
`;
