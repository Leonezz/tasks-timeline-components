import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { AppProvider } from "../../components/AppContext";
import { Badge } from "../../components/ui/badge";
import { badgeVariants } from "../../components/ui/badge-variants";
import { Button } from "../../components/ui/button";
import { buttonVariants } from "../../components/ui/button-variants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { expectReadable, waitForOpaque } from "../test-utils";

/**
 * The text the ui primitives colour with the primary, destructive and accent
 * tokens: the default button and badge (primary-foreground on primary), the
 * destructive button and badge (destructive-foreground on destructive), the
 * link button (primary) and a focused dropdown item (accent-foreground on
 * accent, which ghost and outline buttons also show on hover).
 */
const meta: Meta = {
  title: "UI/ThemeColors",
  parameters: {
    layout: "centered",
    // Fail on any axe violation (the default only reports them), such as
    // text below WCAG AA contrast
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const themedColorsStory = (theme: string): Story => ({
  render: () => (
    <AppProvider theme={theme}>
      <div className="flex flex-col items-start gap-3 bg-background p-4">
        <Button>Save</Button>
        {/* The default button's hover:bg-primary/90, which a synthetic
            pointer event doesn't show */}
        <Button className="bg-primary/90">Hovered</Button>
        <Badge>New</Badge>
        {/* The default badge's hover colour, for the same reason */}
        <Badge className="bg-primary/90">Hovered badge</Badge>
        <Button variant="destructive">Delete</Button>
        {/* The destructive button's and badge's hover colours */}
        <Button variant="destructive" className="bg-destructive/90">
          Hovered delete
        </Button>
        <Badge variant="destructive">Overdue</Badge>
        <Badge variant="destructive" className="bg-destructive/90">
          Hovered overdue
        </Badge>
        <Button variant="link">Learn more</Button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </AppProvider>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("The hovered stand-ins use the real hover colours", () => {
      expect(buttonVariants()).toContain("hover:bg-primary/90");
      expect(badgeVariants()).toContain("hover:bg-primary/90");
      expect(buttonVariants({ variant: "destructive" })).toContain(
        "hover:bg-destructive/90",
      );
      expect(badgeVariants({ variant: "destructive" })).toContain(
        "hover:bg-destructive/90",
      );
    });

    await step(
      "The default button and badge (both also hovered) and link meet WCAG AA (4.5:1)",
      async () => {
        await expectReadable(canvas.getByRole("button", { name: "Save" }));
        await expectReadable(canvas.getByRole("button", { name: "Hovered" }));
        await expectReadable(canvas.getByText("New"));
        await expectReadable(canvas.getByText("Hovered badge"));
        await expectReadable(
          canvas.getByRole("button", { name: "Learn more" }),
        );
      },
    );

    await step(
      "The destructive button and badge (both also hovered) meet AA",
      async () => {
        await expectReadable(canvas.getByRole("button", { name: "Delete" }));
        await expectReadable(
          canvas.getByRole("button", { name: "Hovered delete" }),
        );
        await expectReadable(canvas.getByText("Overdue"));
        await expectReadable(canvas.getByText("Hovered overdue"));
      },
    );

    await step("A focused dropdown item meets AA", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Options" }));
      const item = await canvas.findByRole("menuitem", { name: "Edit" });
      // Let it finish fading in before axe checks its colours
      await waitForOpaque(item);
      // Opened by pointer, the menu focuses its first item on ArrowDown
      await userEvent.keyboard("{ArrowDown}");
      expect(item).toHaveFocus();
      await expectReadable(item);
    });
  },
});

export const LightTheme: Story = themedColorsStory("light");
export const DarkTheme: Story = themedColorsStory("dark");
export const MidnightTheme: Story = themedColorsStory("midnight");
export const CoffeeTheme: Story = themedColorsStory("coffee");
