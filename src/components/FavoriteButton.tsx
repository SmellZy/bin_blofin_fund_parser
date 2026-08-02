type FavoriteButtonProps = { favorite: boolean; symbol: string; onToggle: () => void };

export function FavoriteButton({ favorite, symbol, onToggle }: FavoriteButtonProps) {
  return <button className={`favorite-button ${favorite ? "selected" : ""}`} onClick={onToggle} aria-label={`${favorite ? "Remove" : "Add"} ${symbol} ${favorite ? "from" : "to"} favorites`} aria-pressed={favorite}>{favorite ? "★" : "☆"}</button>;
}
