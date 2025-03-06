import * as React from "react"
import { isIOSDevice, getIOSVersion } from "@/lib/utils"

const MOBILE_BREAKPOINT = 768

// Hook for checking if viewport width is mobile-sized
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Hook for detecting iOS devices
export function useIsIOS() {
  const [isIOS, setIsIOS] = React.useState(false)
  
  React.useEffect(() => {
    setIsIOS(isIOSDevice())
  }, [])
  
  return isIOS
}

// Hook for detecting iOS version
export function useIOSVersion() {
  const [iosVersion, setIOSVersion] = React.useState<number | null>(null)
  const isIOS = useIsIOS()
  
  React.useEffect(() => {
    if (isIOS) {
      setIOSVersion(getIOSVersion())
    }
  }, [isIOS])
  
  return iosVersion
}

// Combined device information hook
export function useDeviceInfo() {
  const isMobile = useIsMobile()
  const isIOS = useIsIOS()
  const iosVersion = useIOSVersion()
  
  // Check if it's an iPhone with notch (iPhone X and newer)
  const hasNotch = React.useMemo(() => {
    if (!isIOS) return false
    
    // iPhone X and newer have iOS 11+ and specific dimensions
    const isIPhoneWithNotch = iosVersion !== null && iosVersion >= 11 && 
      (typeof window !== 'undefined' && 
       ((window.innerWidth === 375 && window.innerHeight === 812) || 
        (window.innerWidth === 414 && window.innerHeight === 896) ||
        (window.innerWidth === 390 && window.innerHeight === 844) ||
        (window.innerWidth === 428 && window.innerHeight === 926)))
    
    return isIPhoneWithNotch
  }, [isIOS, iosVersion])
  
  return {
    isMobile,
    isIOS,
    iosVersion,
    hasNotch,
    isIOSMobile: isMobile && isIOS
  }
}
