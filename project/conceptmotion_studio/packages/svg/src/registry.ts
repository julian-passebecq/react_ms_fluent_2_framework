import type { RendererRegistration, SvgRenderer } from './types.js';

export class RendererRegistry {
  private readonly registrations = new Map<string, RendererRegistration<unknown>>();

  register<Input>(registration: RendererRegistration<Input>): this {
    const id = registration.id.trim();
    const family = registration.family.trim();
    if (!id) throw new Error('Renderer registration id must be non-empty.');
    if (!family) throw new Error(`Renderer "${id}" must declare a family.`);
    if (this.registrations.has(id)) throw new Error(`Renderer "${id}" is already registered.`);
    this.registrations.set(id, registration as unknown as RendererRegistration<unknown>);
    return this;
  }

  replace<Input>(registration: RendererRegistration<Input>): this {
    this.registrations.delete(registration.id);
    return this.register(registration);
  }

  unregister(id: string): boolean {
    return this.registrations.delete(id);
  }

  has(id: string): boolean {
    return this.registrations.has(id);
  }

  create<Input>(id: string): SvgRenderer<Input> {
    const registration = this.registrations.get(id);
    if (!registration) {
      const available = this.ids().join(', ');
      throw new Error(`Unknown SVG renderer "${id}".${available ? ` Available: ${available}.` : ''}`);
    }
    return registration.create() as SvgRenderer<Input>;
  }

  get(id: string): Readonly<RendererRegistration<unknown>> | undefined {
    return this.registrations.get(id);
  }

  ids(family?: string): string[] {
    return [...this.registrations.values()]
      .filter((registration) => !family || registration.family === family)
      .map((registration) => registration.id)
      .sort((left, right) => left.localeCompare(right));
  }

  entries(family?: string): ReadonlyArray<Readonly<RendererRegistration<unknown>>> {
    return this.ids(family).map((id) => this.registrations.get(id)!);
  }
}

export function createRendererRegistry(
  registrations: readonly RendererRegistration<unknown>[] = [],
): RendererRegistry {
  const registry = new RendererRegistry();
  registrations.forEach((registration) => registry.register(registration));
  return registry;
}
