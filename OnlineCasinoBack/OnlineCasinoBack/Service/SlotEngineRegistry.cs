using OnlineCasinoBack.Models.Slot;

namespace OnlineCasinoBack.Service
{
    public class SlotEngineRegistry
    {
        private readonly Dictionary<string, ISlotEngine> _engines;

        public SlotEngineRegistry(IEnumerable<ISlotEngine> engines)
        {
            _engines = engines.ToDictionary(e => e.Key);
        }

        public ISlotEngine GetEngine(string key)
        {
            if (!_engines.TryGetValue(key, out var engine))
                throw new KeyNotFoundException($"No engine registered for key '{key}'.");
            return engine;
        }
    }
}
