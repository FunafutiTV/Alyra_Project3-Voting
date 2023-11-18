'use client'

// RainbowKit
import { ConnectButton } from "@rainbow-me/rainbowkit";

// ChakraUI
import { Flex } from "@chakra-ui/react";

// Nextjs
import Image from "next/image";

const Header = () => {
  return (
    <Flex 
        p="2rem" 
        justifyContent="space-between" 
        alignContent="center">
        <Image
          src="/Logo/logoVote2.png"
          alt="Logo"
          width={100}
          height={100}
        />
        <ConnectButton />
    </Flex>
)
}
export default Header;