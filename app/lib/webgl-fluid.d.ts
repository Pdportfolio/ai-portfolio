declare module "webgl-fluid" {
  type FluidColor = { r: number; g: number; b: number };

  type FluidOptions = {
    IMMEDIATE?: boolean;
    TRIGGER?: "hover" | "click";
    AUTO?: boolean;
    INTERVAL?: number;
    SIM_RESOLUTION?: number;
    DYE_RESOLUTION?: number;
    CAPTURE_RESOLUTION?: number;
    DENSITY_DISSIPATION?: number;
    VELOCITY_DISSIPATION?: number;
    PRESSURE?: number;
    PRESSURE_ITERATIONS?: number;
    CURL?: number;
    SPLAT_RADIUS?: number;
    SPLAT_FORCE?: number;
    SPLAT_COUNT?: number;
    SPLAT_COLOR?: FluidColor;
    SHADING?: boolean;
    COLORFUL?: boolean;
    COLOR_UPDATE_SPEED?: number;
    PAUSED?: boolean;
    BACK_COLOR?: FluidColor;
    TRANSPARENT?: boolean;
    BLOOM?: boolean;
    SUNRAYS?: boolean;
  };

  export default function WebGLFluid(canvas: HTMLCanvasElement, options?: FluidOptions): void;
}
