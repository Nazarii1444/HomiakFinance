import React from "react";
import {Box, Typography} from "@mui/material";
import type {CategoryItem} from "../types.ts";

const BACKGROUND_GREY = '#f8fafc';
const TEXT_DARK = '#1e293b';

const CategoryTile: React.FC<{
  category: CategoryItem;
  isSelected: boolean;
  onClick: () => void;
  color: string;
}> = ({ category, isSelected, onClick, color }) => (
  <Box
    onClick={onClick}
    className="category-tile"
    sx={{
      border: isSelected ? `2px solid ${color}` : '2px solid transparent',
      backgroundColor: isSelected ? `${color}1A` : 'transparent',
      '&:hover': {
        backgroundColor: `${color}0A`,
        transform: 'scale(1.02)',
      },
    }}
  >
    <Box
      className="icon-circle"
      sx={{
        backgroundColor: isSelected ? `${color}1A !important` : BACKGROUND_GREY,
        color: isSelected ? `${color} !important` : 'transparent',
      }}
    >
      {category.icon}
    </Box>
    <Typography
      variant="caption"
      className="tile-caption"
      sx={{
        color: isSelected ? TEXT_DARK : color,
      }}
    >
      {category.name}
    </Typography>
  </Box>
);

export default CategoryTile;