"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#contact", label: "Contact" },
];

export const Header = () => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static" className="bg-blue-600 text-white shadow-md">
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="#home"
          className="mr-2 font-bold text-white no-underline"
          aria-label="MySite home"
          color="inherit"
        >
          MySite
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop nav */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          {navLinks.map((link) => (
            <Button
              key={link.href}
              href={link.href}
              color="inherit"
              onClick={handleCloseNavMenu}
              className="text-white font-medium normal-case hover:text-gray-200"
            >
              {link.label}
            </Button>
          ))}
        </Box>

        {/* Mobile hamburger */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            aria-label="open navigation menu"
            aria-controls="appbar-nav-menu"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="appbar-nav-menu"
            anchorEl={anchorElNav}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            keepMounted
            className="bg-blue-600 text-white"
            MenuListProps={{ className: "bg-blue-600 text-white" }}
          >
            {navLinks.map((link) => (
              <MenuItem
                key={link.href}
                onClick={handleCloseNavMenu}
                component="a"
                href={link.href}
                className="text-white hover:bg-blue-700"
              >
                <Typography textAlign="center" className="text-white">
                  {link.label}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
