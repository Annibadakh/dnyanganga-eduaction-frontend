import logo from '../Images/logo2.png'
const Header = () => {
    return(
        <nav className='flex justify-between px-20 items-center min-h-18 bg-gray-200'>
            <div>
                <img src={logo} className='h-16' alt="logo" />
            </div>
            <div>
                <h1 className='text-2xl font-bold'>Dnyanganga Education Pvt. Ltd</h1>
            </div>
            <div>
                <button>Logout</button>
            </div>
        </nav>
    )
};

export default Header;