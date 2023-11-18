// Components
import Header from "@/components/Header/Header"
import CurrentDisplay from "@/components/CurrentDisplay/CurrentDisplay"
import { Box } from "@chakra-ui/react"

export default function Home() {
  return (
    <Box minHeight="100vh" bgGradient="linear(to-br, rgba(255,255,255,1), rgba(255,255,255,1) 20%, rgba(236,227,241,1))">
      <Header />
      <CurrentDisplay/>
    </Box>
  )
}