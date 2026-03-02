import { ThemeModule } from './types';
import MasterStandard from './MasterStandard';
import PROCustom from './PROCustom';
import Orex from './Orex';
import Aura from './Aura';

export const themes: Record<string, ThemeModule> = {
    'master-standard': MasterStandard,
    'pro-custom': PROCustom,
    'orex': Orex,
    'aura': Aura,
};

console.log('Loading Theme Registry. Available:', Object.keys(themes));

export const defaultThemeId = 'master-standard';
