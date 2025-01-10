import logo from '../Images/logo.png'
const Navbar = () => {
    return(
        <nav className='fixed top-10 left-0  right-0 flex justify-between px-10 items-center bg-gray-200'>
            <div>
                <img src={logo} alt="" className='h-20' />
            </div>
            <div className='flex list-none gap-6'>
                <li>Home</li>
                <li>About</li>
                <li>Courses</li>
                <li>Contact us</li>
                <li>App</li>
                <li>Demo</li>
            </div>
            <div className='absolute right-10 -top-7 flex list-none gap-6 bg-red-600 px-10 py-2'>
                <li>Home</li>
                <li>About</li>
                <li>Courses</li>
            </div>
        </nav>
    )
};

export default Navbar;