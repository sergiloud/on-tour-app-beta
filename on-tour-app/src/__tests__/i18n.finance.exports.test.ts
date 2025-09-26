import { setLang, t } from '../lib/i18n';

describe('i18n finance export keys', () => {
  it('resolves finance export messages in en', () => {
    setLang('en' as any);
    expect(t('finance.export.csv.success')).toMatch(/CSV exported|CSV/);
    expect(t('finance.export.xlsx.success')).toMatch(/XLSX exported|XLSX/);
  });
  it('resolves finance export messages in es', () => {
    setLang('es' as any);
    expect(t('finance.export.csv.success')).toMatch(/CSV exportado|CSV/);
    expect(t('finance.export.xlsx.success')).toMatch(/XLSX exportado|XLSX/);
  });
});
