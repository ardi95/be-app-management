export interface IRequestMenu {
  key_menu: string;
  name: string;
  url?: string | null;
}

export interface IRequestMenuStore extends IRequestMenu {
  menu_id?: number | null;
}

export interface IRequestMenuSort {
  list_menu: { id: number }[];
}
