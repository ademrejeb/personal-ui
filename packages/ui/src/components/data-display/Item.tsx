import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
} from "react";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type ItemVariant = "default" | "outline" | "muted";
export type ItemSize = "sm" | "md";
export type ItemSlot = "root" | "media" | "content" | "title" | "description" | "actions";
export type ItemClassNames = SlotClassNames<ItemSlot>;

interface ItemContextValue {
  config: SlotConfig<ItemSlot>;
  size: ItemSize;
  variant: ItemVariant;
}

const ItemContext = createContext<ItemContextValue | null>(null);

const useItem = (): ItemContextValue => {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error("Item subcomponents must be used within an <Item>.");
  return ctx;
};

export interface ItemProps
  extends HTMLAttributes<HTMLDivElement>,
    SlotConfig<ItemSlot> {
  variant?: ItemVariant;
  size?: ItemSize;
}

const ItemRoot = forwardRef<HTMLDivElement, ItemProps>(function Item(
  { className, variant = "default", size = "md", unstyled = false, classNames, ...rest },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  return (
    <ItemContext.Provider value={{ config, size, variant }}>
      <div
        ref={ref}
        data-variant={variant}
        data-size={size}
        className={slotClass(config, "root", "ui-item", className)}
        {...rest}
      />
    </ItemContext.Provider>
  );
});
ItemRoot.displayName = "Item";

export type ItemMediaProps = HTMLAttributes<HTMLDivElement>;
export const ItemMedia = forwardRef<HTMLDivElement, ItemMediaProps>(function ItemMedia(
  { className, ...rest },
  ref,
) {
  const { config } = useItem();
  return (
    <div
      ref={ref}
      className={slotClass(config, "media", "ui-item__media", className)}
      {...rest}
    />
  );
});
ItemMedia.displayName = "Item.Media";

export type ItemContentProps = HTMLAttributes<HTMLDivElement>;
export const ItemContent = forwardRef<HTMLDivElement, ItemContentProps>(function ItemContent(
  { className, ...rest },
  ref,
) {
  const { config } = useItem();
  return (
    <div
      ref={ref}
      className={slotClass(config, "content", "ui-item__content", className)}
      {...rest}
    />
  );
});
ItemContent.displayName = "Item.Content";

export type ItemTitleProps = HTMLAttributes<HTMLDivElement>;
export const ItemTitle = forwardRef<HTMLDivElement, ItemTitleProps>(function ItemTitle(
  { className, ...rest },
  ref,
) {
  const { config } = useItem();
  return (
    <div
      ref={ref}
      className={slotClass(config, "title", "ui-item__title", className)}
      {...rest}
    />
  );
});
ItemTitle.displayName = "Item.Title";

export type ItemDescriptionProps = HTMLAttributes<HTMLDivElement>;
export const ItemDescription = forwardRef<HTMLDivElement, ItemDescriptionProps>(
  function ItemDescription({ className, ...rest }, ref) {
    const { config } = useItem();
    return (
      <div
        ref={ref}
        className={slotClass(config, "description", "ui-item__description", className)}
        {...rest}
      />
    );
  },
);
ItemDescription.displayName = "Item.Description";

export type ItemActionsProps = HTMLAttributes<HTMLDivElement>;
export const ItemActions = forwardRef<HTMLDivElement, ItemActionsProps>(function ItemActions(
  { className, ...rest },
  ref,
) {
  const { config } = useItem();
  return (
    <div
      ref={ref}
      className={slotClass(config, "actions", "ui-item__actions", className)}
      {...rest}
    />
  );
});
ItemActions.displayName = "Item.Actions";

/** Compound media + content + actions row for lists, menus, and cards. */
export const Item = Object.assign(ItemRoot, {
  Media: ItemMedia,
  Content: ItemContent,
  Title: ItemTitle,
  Description: ItemDescription,
  Actions: ItemActions,
});
