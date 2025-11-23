import { Button } from "@components/ui/button";
import { toast } from "sonner";
import { ButtonGroup } from "./ui/button-group";
import { SearchIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Kbd } from "./ui/kbd";
import { BadgeCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "./ui/slider";
import { useState } from "react";

const ColorBlock = ({
  className,
  style,
}: {
  className: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`h-16 w-16 rounded-md border border-gray-300 cursor-pointer hover:scale-105 transition-transform ${className}`}
    style={style}
    onClick={() => {
      navigator.clipboard.writeText(className);
      toast.success(`Copied "${className}" to clipboard`);
    }}
    title={`Click to copy ${className}`}
  />
);

const ColorPalette = ({
  name,
  shades,
}: {
  name: string;
  shades?: number[];
}) => {
  const defaultShades = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  const colorShades = shades || defaultShades;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid grid-cols-3 gap-2">
        {colorShades.map((shade) => (
          <ColorBlock
            key={`${name}-${shade}`}
            className={`bg-${name}-${shade}`}
            style={{ backgroundColor: `var(--color-${name}-${shade})` }}
          />
        ))}
      </div>
      <span className="text-sm font-medium capitalize">{name}</span>
    </div>
  );
};

const ColorSwatch = () => {
  const [colorValue, setColorValue] = useState<number>(500);

  const defaultShades = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  const defaultColors = [
    "apricot",
    "mustard",
    "avocado",
    "aquamarine",
    "pelorus",
    "azure",
    "lavender",
    "flamingo",
  ];

  return (
    <div className="my-4">
      <div className="mb-2 font-medium">Shade: {colorValue}</div>
      <Slider
        value={[colorValue]}
        max={Math.max(...defaultShades)}
        min={Math.min(...defaultShades)}
        step={100}
        className="w-[60%] m-3"
        onValueChange={(value) => setColorValue(value[0])}
      />

      <div className="flex flex-wrap gap-4">
        {defaultColors.map((color) => (
          <ColorBlock
            key={`${color}-${colorValue}`}
            className={`bg-${color}-${colorValue}`}
            style={{ backgroundColor: `var(--color-${color}-${colorValue})` }}
          />
        ))}
      </div>
    </div>
  );
};

const UIKit = () => {
  return (
    <>
      <div>
        <h1 className="font-display text-4xl">UI Kit</h1>
        <p>This is a placeholder for the UI Kit documentation.</p>
        <Button
          onClick={() => {
            toast.info("Informations toast");
          }}
        >
          Show Info Toast
        </Button>
        <Button variant={"secondary"}>Secondary Button</Button>
        <Button variant={"destructive"}>Destructive Button</Button>
        <Button variant={"outline"}>Outline Button</Button>
        <Button variant={"ghost"}>Ghost Button</Button>
        <Button variant={"link"}>Link Button</Button>
        <Separator className="my-4" />
        <ButtonGroup>
          <Input placeholder="Search..." />
          <Button variant="outline" aria-label="Search">
            <SearchIcon />
          </Button>
        </ButtonGroup>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outline" size="sm" className="pr-2">
          Accept <Kbd>⏎</Kbd>
        </Button>
        <Button variant="outline" size="sm" className="pr-2">
          Cancel <Kbd>Esc</Kbd>
        </Button>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-col items-center gap-2">
        <div className="flex w-full flex-wrap gap-2">
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="flex w-full flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="bg-blue-500 text-white dark:bg-blue-600"
          >
            <BadgeCheckIcon />
            Verified
          </Badge>
          <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">
            8
          </Badge>
          <Badge
            className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
            variant="destructive"
          >
            99
          </Badge>
          <Badge
            className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
            variant="outline"
          >
            20+
          </Badge>
        </div>
      </div>
      {/* Color Palette */}
      <Separator className="my-4" />
      <div>
        <h2 className="font-display text-2xl">Theme</h2>
        <ButtonGroup>
          <Button className="bg-primary">Primary</Button>
          <Button className="bg-secondary">Secondary</Button>
          <Button className="bg-tertiary">Tertiary</Button>
        </ButtonGroup>
        <div className="flex flex-wrap gap-4 mt-2">
          <ColorBlock className="bg-primary" />
          <ColorBlock className="bg-secondary" />
          <ColorBlock className="bg-tertiary" />
        </div>
        <h3 className="font-display text-xl mt-4">Accent Colors</h3>
        <div className="flex flex-wrap gap-4 mt-2">
          <ColorBlock className="bg-accent-playground" />
          <ColorBlock className="bg-accent-unified" />
          <ColorBlock className="bg-accent-portfolio" />
          <ColorBlock className="bg-accent-blog" />
        </div>
        <h3 className="font-display text-xl mt-4">Status Colors</h3>
        <div className="flex flex-wrap gap-4 mt-2">
          <ColorBlock className="bg-status-processing" />
          <ColorBlock className="bg-status-critical" />
          <ColorBlock className="bg-status-serious" />
          <ColorBlock className="bg-status-stable" />
          <ColorBlock className="bg-status-resolved" />
        </div>
        <h3 className="font-display text-xl mt-4">Palettes </h3>
        <ColorSwatch />
        <div className="flex flex-wrap gap-8 mt-2">
          <ColorPalette name="apricot" />
          <ColorPalette
            name="mustard"
            shades={[
              50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1050,
            ]}
          />
          <ColorPalette name="avocado" />
          <ColorPalette name="aquamarine" />
          <ColorPalette name="pelorus" />
          <ColorPalette name="azure" />
          <ColorPalette name="lavender" />
          <ColorPalette name="flamingo" />
        </div>
      </div>
    </>
  );
};

export default UIKit;
