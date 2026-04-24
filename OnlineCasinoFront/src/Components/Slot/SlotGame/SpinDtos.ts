export interface WinLineDto {
  paylineId:   number;
  symbol:      string;
  matchCount:  number;
  multiplier:  number;
  winAmount:   number;
  positions:   number[];  // row index per reel — add this to your C# DTO too
}
 
export interface SpinResponseDto {
  grid:       string[][];   // [reel][row]
  winAmount:  number;
  newBalance: number;
  isWin:      boolean;
  winLines:   WinLineDto[];
}
 
export interface SpinRequestDto {
  betAmount: number;
}
 