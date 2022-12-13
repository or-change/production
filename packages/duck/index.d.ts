import { GlobalKit } from '@produck/kit';
import { Schema } from '@produck/mold/types/schema';

interface DuckKit extends GlobalKit {
	duck: { version: string }
}

interface ProviderKit extends DuckKit {
	produck: {
		meta: {
			id: string;
			name: string;
			version: string;
			description: string;
		};

		components: Array<{
			id: string;
			name: string;
			version: string;
			description: string;
		}>;
	};
}

interface BaseKit extends ProviderKit {

}

interface InstalledKit extends BaseKit {

}

interface Component {
	/**
	 * The component unique id.
	 * Example: org.orchange.duck.default
	 */
	id: String,

	/**
	 * The component name for reading.
	 */
	name: String,

	/**
	 * The component version in semver.
	 */
	version?: String;

	/**
	 * Invoking when Product is called.
	 * Some new functions CAN be set into baseInjection
	 */
	install?: (Kit: BaseKit) => void;

	/**
	 * Invoking after all components have been installed.
	 * You MAY set some new functions into installedInjection
	 */
	created?: (Kit: InstalledKit) => void;

	/**
	 * Description of the component.
	 */
	description?: String;
}

interface ProductProviderOptions {
	/**
	 * Product id
	 */
	id: String

	name?: String

	version?: String

	description?: String

	/**
	 * Duck components list. Use to mixin some function into injection.
	 */
	components?: Array<Component>
}

interface ProductProvider {
	<Type>(
		options: ProductProviderOptions,
		assembler: () => any
	): (...args: any[]) => Type;
}

export function defineAny<T>(any: T): T;
export function defineComponent(component: Component): Component;
export const define: ProductProvider;

export namespace Options {
	export function normalize(
		options: ProductProviderOptions
	): ProductProviderOptions;

	export const Schema: Schema<ProductProviderOptions>;
	export const ComponentSchema: Schema<Component>;
}
