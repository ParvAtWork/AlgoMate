using Microsoft.AspNetCore.Mvc;

namespace algomate_backend.Controllers
{
    [ApiController]
    [Route("/")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public IActionResult Index()
        {
            return Ok("AlgoMate backend is running successfully 🚀");
        }
    }
}