import { Outlet } from 'react-router-dom'
import SideBar from '../shared/components/sideBar/SideBar'

const Layout = () => {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <SideBar />
            <main className="flex-1 ml-[210px] p-4 overflow-y-auto scrollbar-hide">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout
