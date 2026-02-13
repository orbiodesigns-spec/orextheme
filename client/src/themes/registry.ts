import { ThemeModule } from './types';
import MasterStandard from './MasterStandard';
import PROCustom from './PROCustom';
import Orex from './Orex';

export const themes: Record<string, ThemeModule> = {
    'master-standard': MasterStandard,
    'pro-custom': PROCustom,
    'orex': Orex,
};

console.log('Loading Theme Registry. Available:', Object.keys(themes));

export const defaultThemeId = 'master-standard';
