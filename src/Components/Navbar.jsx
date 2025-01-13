import logo from '../Images/logo2.png'
const Navbar = () => {
    return(
        <nav className='fixed top-8 left-2 right-2 flex justify-between px-10 py-1 items-center'>
            <div className='absolute top-0 -z-10 h-[70px] left-4 right-4 bg-gray-200' style={{transform: "skewX(-26deg)"}}>

            </div>
            <div>
                <img src={logo} alt="" className='h-16' />
            </div>
            <div className='flex list-none gap-6'>
                <li>Home</li>
                <li>About</li>
                <li>Courses</li>
                <li>Contact us</li>
                <li>App</li>
                <li>Demo</li>
            </div>
            <div className='absolute right-10 z-40 -top-6 h-10 w-96 flex list-none gap-6 bg-primary px-10 py-2' style={{transform: "skewX(26deg)"}}></div>
            <div className='absolute text-white right-10 z-40 -top-6 flex list-none gap-6 px-10 py-2'>
                <li>Home</li>
                <li>About</li>
                <li>Courses</li>
            </div>
            <div className='absolute -top-6 right-[408px] h-6 w-8 bg-primary' style={{transform: "skewX(-26deg)"}}></div>
            
        </nav>
    )
};

export default Navbar;