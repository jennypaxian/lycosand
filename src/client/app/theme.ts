import * as tinycolor from 'tinycolor2';

export type Theme = {
	id: string;
	name: string;
	author: string;
	desc?: string;
	base?: 'dark' | 'light';
	vars: { [key: string]: string };
	props: { [key: string]: string };
};

export const lightTheme: Theme = require('../theme/light.json5');
export const darkTheme: Theme = require('../theme/dark.json5');
export const pinkTheme: Theme = require('../theme/pink.json5');
export const blackTheme: Theme = require('../theme/black.json5');
export const halloweenTheme: Theme = require('../theme/halloween.json5');

export const builtinThemes = [
	lightTheme,
	darkTheme,
	pinkTheme,
	blackTheme,
	halloweenTheme
];

export function applyTheme(theme: Theme, persisted = true) {
	// Deep copy
	const _theme = JSON.parse(JSON.stringify(theme));

	if (_theme.base) {
		const base = [lightTheme, darkTheme].find(x => x.id == _theme.base);
		_theme.vars = Object.assign({}, base.vars, _theme.vars);
		_theme.props = Object.assign({}, base.props, _theme.props);
	}

	const props = compile(_theme);

	Object.entries(props).forEach(([k, v]) => {
		document.documentElement.style.setProperty(`--${k}`, v.toString());
	});

	if (persisted) {
		localStorage.setItem('theme', JSON.stringify(props));
	}
}

function compile(theme: Theme): { [key: string]: string } {
	function getColor(code: string): tinycolor.Instance {
		// ref
		if (code[0] == '@') {
			return getColor(theme.props[code.substr(1)]);
		}
		if (code[0] == '$') {
			return getColor(theme.vars[code.substr(1)]);
		}

		// func
		if (code[0] == ':') {
			const parts = code.split('<');
			const func = parts.shift().substr(1);
			const arg = parseFloat(parts.shift());
			const color = getColor(parts.join('<'));

			switch (func) {
				case 'darken': return color.darken(arg);
				case 'lighten': return color.lighten(arg);
				case 'alpha': return color.setAlpha(arg);
			}
		}

		return tinycolor(code);
	}

	const props = {};

	Object.entries(theme.props).forEach(([k, v]) => {
		const c = getColor(v);
		props[k] = genValue(c);
	});

	const primary = getColor(props['primary']);

	for (let i = 1; i < 10; i++) {
		const color = primary.clone().setAlpha(i / 10);
		props['primaryAlpha0' + i] = genValue(color);
	}

	for (let i = 1; i < 100; i++) {
		const color = primary.clone().lighten(i);
		props['primaryLighten' + i] = genValue(color);
	}

	for (let i = 1; i < 100; i++) {
		const color = primary.clone().darken(i);
		props['primaryDarken' + i] = genValue(color);
	}

	return props;
}

function genValue(c: tinycolor.Instance): string {
	return c.toRgbString();
}
