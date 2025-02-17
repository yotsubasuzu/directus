// import { i18n } from '../lang';
import type { Locale } from 'date-fns';

const locales: { lang: string; locale: Locale }[] = [];

export function getDateFNSLocale(): Locale | undefined {
	// const currentLang = i18n.global.locale.value;
	const currentLang = 'en-US';
	return locales.find(({ lang }) => currentLang === lang)?.locale;
}

export async function loadDateFNSLocale(lang: string) {
	const localesToTry = [lang, (lang.split('-') as [string, string])[0], 'en-US'];

	let locale;

	for (const l of localesToTry) {
		try {
			const mod = await importDateLocale(l);
			locale = mod.default;
			locales.push({ lang, locale });
			break;
		} catch {
			continue;
		}
	}

	return locale;
}

export function importDateLocale(locale: string): Promise<any> {
	switch (locale) {
		case 'af':
			//@ts-ignore
			return import('date-fns/locale/af');
		case 'ar-DZ':
			//@ts-ignore
			return import('date-fns/locale/ar-DZ');
		case 'ar-MA':
			//@ts-ignore
			return import('date-fns/locale/ar-MA');
		case 'ar-SA':
			//@ts-ignore
			return import('date-fns/locale/ar-SA');
		case 'az':
			//@ts-ignore
			return import('date-fns/locale/az');
		case 'be':
			//@ts-ignore
			return import('date-fns/locale/be');
		case 'bg':
			//@ts-ignore
			return import('date-fns/locale/bg');
		case 'bn':
			//@ts-ignore
			return import('date-fns/locale/bn');
		case 'ca':
			//@ts-ignore
			return import('date-fns/locale/ca');
		case 'cs':
			//@ts-ignore
			return import('date-fns/locale/cs');
		case 'cy':
			//@ts-ignore
			return import('date-fns/locale/cy');
		case 'da':
			//@ts-ignore
			return import('date-fns/locale/da');
		case 'de':
			//@ts-ignore
			return import('date-fns/locale/de');
		case 'de-AT':
			//@ts-ignore
			return import('date-fns/locale/de-AT');
		case 'el':
			//@ts-ignore
			return import('date-fns/locale/el');
		case 'en-AU':
			//@ts-ignore
			return import('date-fns/locale/en-AU');
		case 'en-CA':
			//@ts-ignore
			return import('date-fns/locale/en-CA');
		case 'en-GB':
			//@ts-ignore
			return import('date-fns/locale/en-GB');
		case 'en-IN':
			//@ts-ignore
			return import('date-fns/locale/en-IN');
		case 'en-NZ':
			//@ts-ignore
			return import('date-fns/locale/en-NZ');
		case 'en-US':
			//@ts-ignore
			return import('date-fns/locale/en-US');
		case 'en-ZA':
			//@ts-ignore
			return import('date-fns/locale/en-ZA');
		case 'eo':
			//@ts-ignore
			return import('date-fns/locale/eo');
		case 'es':
			//@ts-ignore
			return import('date-fns/locale/es');
		case 'et':
			//@ts-ignore
			return import('date-fns/locale/et');
		case 'eu':
			//@ts-ignore
			return import('date-fns/locale/eu');
		case 'fa-IR':
			//@ts-ignore
			return import('date-fns/locale/fa-IR');
		case 'fi':
			//@ts-ignore
			return import('date-fns/locale/fi');
		case 'fr':
			//@ts-ignore
			return import('date-fns/locale/fr');
		case 'fr-CA':
			//@ts-ignore
			return import('date-fns/locale/fr-CA');
		case 'fr-CH':
			//@ts-ignore
			return import('date-fns/locale/fr-CH');
		case 'gd':
			//@ts-ignore
			return import('date-fns/locale/gd');
		case 'gl':
			//@ts-ignore
			return import('date-fns/locale/gl');
		case 'gu':
			//@ts-ignore
			return import('date-fns/locale/gu');
		case 'he':
			//@ts-ignore
			return import('date-fns/locale/he');
		case 'hi':
			//@ts-ignore
			return import('date-fns/locale/hi');
		case 'hr':
			//@ts-ignore
			return import('date-fns/locale/hr');
		case 'ht':
			//@ts-ignore
			return import('date-fns/locale/ht');
		case 'hu':
			//@ts-ignore
			return import('date-fns/locale/hu');
		case 'hy':
			//@ts-ignore
			return import('date-fns/locale/hy');
		case 'id':
			//@ts-ignore
			return import('date-fns/locale/id');
		case 'is':
			//@ts-ignore
			return import('date-fns/locale/is');
		case 'it':
			//@ts-ignore
			return import('date-fns/locale/it');
		case 'ja':
			//@ts-ignore
			return import('date-fns/locale/ja');
		case 'ka':
			//@ts-ignore
			return import('date-fns/locale/ka');
		case 'kk':
			//@ts-ignore
			return import('date-fns/locale/kk');
		case 'kn':
			//@ts-ignore
			return import('date-fns/locale/kn');
		case 'ko':
			//@ts-ignore
			return import('date-fns/locale/ko');
		case 'lb':
			//@ts-ignore
			return import('date-fns/locale/lb');
		case 'lt':
			//@ts-ignore
			return import('date-fns/locale/lt');
		case 'lv':
			//@ts-ignore
			return import('date-fns/locale/lv');
		case 'mk':
			//@ts-ignore
			return import('date-fns/locale/mk');
		case 'mn':
			//@ts-ignore
			return import('date-fns/locale/mn');
		case 'ms':
			//@ts-ignore
			return import('date-fns/locale/ms');
		case 'mt':
			//@ts-ignore
			return import('date-fns/locale/mt');
		case 'nb':
			//@ts-ignore
			return import('date-fns/locale/nb');
		case 'nl':
			//@ts-ignore
			return import('date-fns/locale/nl');
		case 'nl-BE':
			//@ts-ignore
			return import('date-fns/locale/nl-BE');
		case 'nn':
			//@ts-ignore
			return import('date-fns/locale/nn');
		case 'pl':
			//@ts-ignore
			return import('date-fns/locale/pl');
		case 'pt':
			//@ts-ignore
			return import('date-fns/locale/pt');
		case 'pt-BR':
			//@ts-ignore
			return import('date-fns/locale/pt-BR');
		case 'ro':
			//@ts-ignore
			return import('date-fns/locale/ro');
		case 'ru':
			//@ts-ignore
			return import('date-fns/locale/ru');
		case 'sk':
			//@ts-ignore
			return import('date-fns/locale/sk');
		case 'sl':
			//@ts-ignore
			return import('date-fns/locale/sl');
		case 'sq':
			//@ts-ignore
			return import('date-fns/locale/sq');
		case 'sr':
			//@ts-ignore
			return import('date-fns/locale/sr');
		case 'sr-Latn':
			//@ts-ignore
			return import('date-fns/locale/sr-Latn');
		case 'sv':
			//@ts-ignore
			return import('date-fns/locale/sv');
		case 'ta':
			//@ts-ignore
			return import('date-fns/locale/ta');
		case 'te':
			//@ts-ignore
			return import('date-fns/locale/te');
		case 'th':
			//@ts-ignore
			return import('date-fns/locale/th');
		case 'tr':
			//@ts-ignore
			return import('date-fns/locale/tr');
		case 'ug':
			//@ts-ignore
			return import('date-fns/locale/ug');
		case 'uk':
			//@ts-ignore
			return import('date-fns/locale/uk');
		case 'uz':
			//@ts-ignore
			return import('date-fns/locale/uz');
		case 'vi':
			//@ts-ignore
			return import('date-fns/locale/vi');
		case 'zh-CN':
			//@ts-ignore
			return import('date-fns/locale/zh-CN');
		case 'zh-TW':
			//@ts-ignore
			return import('date-fns/locale/zh-TW');
		default:
			return Promise.resolve();
	}
}
