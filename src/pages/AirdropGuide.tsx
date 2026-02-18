import './AirdropGuide.css';

export default function AirdropGuide() {
  return (
    <div className="airdrop-guide-page">
      <div className="noise" />
      <div className="ag-container">
        <header>
          <div className="eyebrow">// airdrop farming guide — 2026</div>
          <h1>Farm the Next<br />Wave of Drops</h1>
          <p className="subtitle">Systematic playbook for maximizing $INK, $POLY, $HYPE S2/S3, $UNIT and 15+ protocols — idle USDC/USDT working while you sleep.</p>
          <div className="meta-bar">
            <div className="meta-item">Updated: <span>Feb 18, 2026</span></div>
            <div className="meta-item">Focus: <span>Nado · Polymarket · Hyperliquid · Unit</span></div>
            <div className="meta-item">Capital: <span>$1K–$10K USDT range</span></div>
            <div className="meta-item">Priority: <span>Non-custodial, delta-neutral where possible</span></div>
          </div>
        </header>

        {/* 00 — CORE THESIS */}
        <div className="section">
          <div className="section-title">00 — Core Thesis</div>
          <div className="alert">⚠ Anti-sybil is now AI-powered. Multi-wallet farming for these specific protocols (Polymarket, Nado, HL) is actively penalized. This guide assumes single-wallet, genuine usage strategy.</div>
          <div className="info-box">
            <strong style={{color:'var(--accent)'}}>The Play:</strong> Your idle USDC/USDT should never sit flat. Every dollar can simultaneously earn yield AND accumulate points. The ideal position: deposit into a yield-generating vault (NLP, XVS, HyperLend) where the capital earns fees while the activity counts toward airdrop eligibility. Stack protocol layers: one action = multiple point systems triggered.
          </div>
          <p>The highest conviction targets for 2026 are <strong>Ink L2 ($INK)</strong> with Kraken backing, <strong>Polymarket ($POLY)</strong> at $9B valuation, and the <strong>Hyperliquid ecosystem</strong> with 38.8% of HYPE supply reserved. Unit's $UNIT ticker was purchased for $350K — a near-certain token launch signal.</p>
        </div>

        {/* 01 — S+ TIER */}
        <div className="section">
          <div className="section-title">01 — S+ Tier: Highest Conviction</div>
          <div className="tier-grid">

            <div className="protocol-card card-s-plus">
              <div className="card-header">
                <div className="protocol-name">Nado DEX</div>
                <div className="tier-badge tier-s-plus">S+</div>
              </div>
              <div className="card-meta">
                <span className="tag tag-green">$INK Confirmed</span>
                <span className="tag">Ink L2 (Kraken)</span>
                <span className="tag">Q1-Q2 2026</span>
                <span className="tag tag-orange">$500+ USDT0</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>CLOB DEX by former Kraken engineers. $5B+ in perp volume during private alpha. Dual airdrop: Nado points → $INK + direct Ink L2 points. NLP vault accepts USDT0 as passive LP.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Run grid bot on XAUTUSDT0 (positive funding = income + points)</li>
                  <li>Deposit into NLP vault (passive LP + collateral for trading)</li>
                  <li>Refer users via invite codes (1 code per 1M volume)</li>
                  <li>Check Points page every Friday — 950K pts distributed weekly</li>
                </ul>
              </div>
              <div className="alpha-box">
                <div className="alpha-label">// alpha</div>
                NLP deposit doubles as trading collateral. $10K in NLP + active trading = maximum point efficiency. Alpha users from private phase get +97K bonus pts/week for 6 weeks of Season 1.
              </div>
              <a href="https://nado.xyz" target="_blank" rel="noreferrer" className="protocol-link">nado.xyz</a>
            </div>

            <div className="protocol-card card-s-plus">
              <div className="card-header">
                <div className="protocol-name">Ink L2</div>
                <div className="tier-badge tier-s-plus">S+</div>
              </div>
              <div className="card-meta">
                <span className="tag tag-green">$INK Confirmed</span>
                <span className="tag">Kraken-backed</span>
                <span className="tag">Q1-Q2 2026</span>
                <span className="tag tag-orange">$100+ ETH</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>Kraken's L2. Every interaction with Nado, Tydro, or Velodrome on Ink accumulates Ink points. Potentially replicates $BNB price action if ecosystem grows. Low barrier — bridge + use anything.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Bridge ETH to Ink via official bridge</li>
                  <li>Claim a .ink domain name (one-time, boosts points)</li>
                  <li>Supply assets to Tydro (lending protocol on Ink)</li>
                  <li>Swap on Velodrome deployed on Ink</li>
                  <li>Every Nado trade = automatic Ink points</li>
                </ul>
              </div>
              <div className="alpha-box">
                <div className="alpha-label">// alpha</div>
                Every Nado user is also farming Ink. If you're already on Nado, your Ink points are accumulating automatically. The .ink domain = low-cost touchpoint that likely gets weighted.
              </div>
              <a href="https://inkonchain.com" target="_blank" rel="noreferrer" className="protocol-link">inkonchain.com</a>
            </div>

            <div className="protocol-card card-s">
              <div className="card-header">
                <div className="protocol-name">Polymarket</div>
                <div className="tier-badge tier-s">S</div>
              </div>
              <div className="card-meta">
                <span className="tag tag-green">$POLY Confirmed</span>
                <span className="tag">Polygon</span>
                <span className="tag">Q2-Q3 2026</span>
                <span className="tag tag-orange">$50-200 USDC</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>$9B valuation, ICE ($NYSE parent) invested $2B. Token confirmed by CMO. US relaunch → then token. Sybil detection is AI-powered — genuine usage only.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Bet on 85-95% probability markets to minimize loss while building volume</li>
                  <li>Diversify across categories: politics, crypto, sports, macro</li>
                  <li>Maintain consistent weekly activity (not one-off dumps)</li>
                  <li>Apply for Polymarket Trader badge on X (Twitter)</li>
                  <li>Use Polyterminal for multi-market efficiency</li>
                </ul>
              </div>
              <div className="alpha-box">
                <div className="alpha-label">// alpha</div>
                Bet $20-50 on near-certain outcomes each week. Expected loss is tiny (5-15% of bet on 90% probability markets). Volume history matters more than profit. Polymarket's own X badge program = additional eligibility signal.
              </div>
              <a href="https://polymarket.com" target="_blank" rel="noreferrer" className="protocol-link">polymarket.com</a>
            </div>

            <div className="protocol-card card-s">
              <div className="card-header">
                <div className="protocol-name">Tydro (Ink)</div>
                <div className="tier-badge tier-s">S</div>
              </div>
              <div className="card-meta">
                <span className="tag tag-green">$INK Confirmed</span>
                <span className="tag">Ink L2</span>
                <span className="tag">Q1-Q2 2026</span>
                <span className="tag tag-orange">$100+ USDC</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>Lending protocol on Ink. Supplying assets = Tydro points + Ink L2 points simultaneously. Confirmed airdrop for users. Idle USDC perfectly deployed here.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Supply USDC/ETH to Tydro lending pools</li>
                  <li>Borrow against collateral to increase utilization</li>
                  <li>Maintain active position — not a one-time deposit</li>
                </ul>
              </div>
              <div className="alpha-box">
                <div className="alpha-label">// alpha</div>
                Perfect for idle stablecoins. Supply USDC to Tydro = earn lending APY + Tydro points + Ink points. Three income streams from one deposit.
              </div>
              <a href="https://tydro.xyz" target="_blank" rel="noreferrer" className="protocol-link">tydro.xyz</a>
            </div>

          </div>
        </div>

        {/* 02 — A TIER */}
        <div className="section">
          <div className="section-title">02 — A Tier: High-Value Secondary Targets</div>
          <div className="tier-grid">

            <div className="protocol-card card-a">
              <div className="card-header">
                <div className="protocol-name">Hyperliquid S2/S3</div>
                <div className="tier-badge tier-a">A+</div>
              </div>
              <div className="card-meta">
                <span className="tag">HYPE Live</span>
                <span className="tag">S2 Unconfirmed</span>
                <span className="tag">HyperEVM</span>
                <span className="tag tag-orange">$500+ USDC + HYPE</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>420M+ HYPE unclaimed. 38.8% of supply for future emissions. Polymarket pricing 52% chance of S2 airdrop by Dec 2026. Delta-neutral strategy earns ~20% APY while farming.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Trade perps on HyperCore (fees generate points)</li>
                  <li>Buy HYPE spot + short HYPE perp (delta-neutral, ~20% APY funding)</li>
                  <li>Stake HYPE → stHYPE (auto-compounding)</li>
                  <li>Deploy stHYPE on HyperLend as collateral</li>
                  <li>LP on KittenSwap (low-TVL pools = highest pts/dollar)</li>
                  <li>Interact with Felix, HypurrFi, Liminal weekly</li>
                </ul>
              </div>
              <div className="alpha-box">
                <div className="alpha-label">// alpha</div>
                Delta-neutral stack: buy HYPE spot → short HYPE perp → deploy spot HYPE on HyperEVM → earn funding fees from short + HyperEVM points. No directional HYPE risk.
              </div>
              <a href="https://app.hyperliquid.xyz" target="_blank" rel="noreferrer" className="protocol-link">app.hyperliquid.xyz</a>
            </div>

            <div className="protocol-card card-a">
              <div className="card-header">
                <div className="protocol-name">Unit (HyperUnit)</div>
                <div className="tier-badge tier-a">A</div>
              </div>
              <div className="card-meta">
                <span className="tag">$UNIT Ticker Secured</span>
                <span className="tag">Hyperliquid L1</span>
                <span className="tag">Q2-Q3 2026</span>
                <span className="tag tag-orange">0.002 BTC or 0.05 ETH min</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>Asset tokenization layer for Hyperliquid. $1B+ TVL, $15B+ volume in 6 months. $UNIT ticker purchased for $350K = near-certain token launch. Every HL spot trade goes through Unit.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Bridge BTC → uBTC on Hyperliquid (min 0.002 BTC)</li>
                  <li>Bridge ETH → uETH on Hyperliquid (min 0.05 ETH)</li>
                  <li>Trade uBTC/uETH on HL spot market regularly</li>
                  <li>Bridge additional assets: SOL, FARTCOIN, PUMP</li>
                  <li>Use uBTC/uETH as collateral on HyperLend</li>
                </ul>
              </div>
              <div className="alpha-box">
                <div className="alpha-label">// alpha</div>
                If you're already on HL spot trading, you're farming $UNIT passively. Explicit bridge transactions (not just spot trades) likely weighted more heavily. Do both.
              </div>
              <a href="https://app.hyperunit.xyz" target="_blank" rel="noreferrer" className="protocol-link">app.hyperunit.xyz</a>
            </div>

            <div className="protocol-card card-a">
              <div className="card-header">
                <div className="protocol-name">Extended DEX</div>
                <div className="tier-badge tier-a">A</div>
              </div>
              <div className="card-meta">
                <span className="tag tag-green">30% Supply Confirmed</span>
                <span className="tag">HL Ecosystem</span>
                <span className="tag">Q2 2026</span>
                <span className="tag tag-orange">$500+ USDC</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>$6.5M raised. 30% of token supply confirmed for airdrop. XVS vault deposits count as trading collateral — earn yield while farming. Equity + commodity perps available.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Deposit USDC into XVS vault (earns yield + farming points)</li>
                  <li>Trade perps using XVS as collateral</li>
                  <li>Trade gold, silver, SPX perps for narrative alignment</li>
                </ul>
              </div>
              <div className="alpha-box">
                <div className="alpha-label">// alpha</div>
                30% confirmed = rare certainty. XVS vault is the most capital-efficient entry: deposit USDC, it earns yield AND acts as perp margin, AND farms airdrop points.
              </div>
              <a href="https://extended.xyz" target="_blank" rel="noreferrer" className="protocol-link">extended.xyz</a>
            </div>

            <div className="protocol-card card-a">
              <div className="card-header">
                <div className="protocol-name">KittenSwap</div>
                <div className="tier-badge tier-a">A</div>
              </div>
              <div className="card-meta">
                <span className="tag">30% Supply Confirmed</span>
                <span className="tag">HyperEVM</span>
                <span className="tag">Q2-Q3 2026</span>
                <span className="tag tag-orange">$200+ HYPE</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>Main ve(3,3) DEX on HyperEVM. Comparison to Shadow on Sonic is apt. 30% of supply for point farmers. Low-TVL pools = exponential points per dollar.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>LP in low-TVL pools (more points per dollar deposited)</li>
                  <li>HYPE/PURR pool = low impermanent loss (correlated assets)</li>
                  <li>Buy MechaCat NFT for 1.28x points multiplier</li>
                  <li>Vote on gauge weekly (consistent on-chain action)</li>
                </ul>
              </div>
              <a href="https://kittenswap.finance" target="_blank" rel="noreferrer" className="protocol-link">kittenswap.finance</a>
            </div>

            <div className="protocol-card card-a">
              <div className="card-header">
                <div className="protocol-name">MegaETH</div>
                <div className="tier-badge tier-a">A</div>
              </div>
              <div className="card-meta">
                <span className="tag">$107M Raised</span>
                <span className="tag">Ethereum L2</span>
                <span className="tag">Q2 2026</span>
                <span className="tag tag-orange">$50+ ETH</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>Founders Fund-backed. XP system since Jan 2025. Polymarket pricing ~94% probability of TGE by June 2026. Consumer-focused L2 with game and DeFi protocols.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Bridge ETH to MegaETH</li>
                  <li>Use ecosystem DeFi (swap, LP, lend)</li>
                  <li>Collect badges via quests</li>
                  <li>Participate in ecosystem games</li>
                </ul>
              </div>
              <a href="https://megaeth.com" target="_blank" rel="noreferrer" className="protocol-link">megaeth.com</a>
            </div>

            <div className="protocol-card card-a">
              <div className="card-header">
                <div className="protocol-name">Base L2</div>
                <div className="tier-badge tier-a">A</div>
              </div>
              <div className="card-meta">
                <span className="tag">Exploring Token</span>
                <span className="tag">Coinbase-backed</span>
                <span className="tag">2026 TBD</span>
                <span className="tag tag-orange">$100+ ETH</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>Jesse Pollak confirmed "exploring network token" Sep 2025. JPMorgan estimates $12-34B market cap. 46.6% of all L2 DeFi TVL. Highest potential upside of any unconfirmed airdrop.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Bridge ETH via official Base Bridge</li>
                  <li>LP on Aerodrome (main DEX)</li>
                  <li>Supply on Aave on Base</li>
                  <li>Use Farcaster (social layer — likely weighted)</li>
                  <li>Mint NFTs on Base</li>
                </ul>
              </div>
              <a href="https://base.org" target="_blank" rel="noreferrer" className="protocol-link">base.org</a>
            </div>

          </div>
        </div>

        {/* 03 — B+ TIER */}
        <div className="section">
          <div className="section-title">03 — B+ Tier: Ecosystem Stack-Ons</div>
          <div className="tier-grid">

            <div className="protocol-card card-b">
              <div className="card-header">
                <div className="protocol-name">TreadFi</div>
                <div className="tier-badge tier-b">B+</div>
              </div>
              <div className="card-meta">
                <span className="tag">$3.5M Raised</span>
                <span className="tag">Multi-DEX</span>
                <span className="tag">Season 1 ends May 18 2026</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>Algo trading terminal. One deposit, farms Nado + HL + Extended simultaneously via delta-neutral bots. Season 1 ends May 18.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Use delta-neutral bot to farm Nado + HL</li>
                  <li>Enable market-maker bot for volume</li>
                </ul>
              </div>
              <a href="https://treadfi.xyz" target="_blank" rel="noreferrer" className="protocol-link">treadfi.xyz</a>
            </div>

            <div className="protocol-card card-b">
              <div className="card-header">
                <div className="protocol-name">Dexari</div>
                <div className="tier-badge tier-b">B+</div>
              </div>
              <div className="card-meta">
                <span className="tag">$DEXARI Ticker Secured</span>
                <span className="tag">Mobile (HL)</span>
                <span className="tag">Q2-Q3 2026</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>Best mobile wallet for Hyperliquid. Former Binance US team. $2.3M funding. Trade HL through Dexari = stack Dexari + HL points. Zero additional capital needed.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Download app, connect HL wallet</li>
                  <li>Execute HL trades via Dexari interface</li>
                  <li>Season 2 points started Jan 2026</li>
                </ul>
              </div>
              <a href="https://dexari.io" target="_blank" rel="noreferrer" className="protocol-link">dexari.io</a>
            </div>

            <div className="protocol-card card-b">
              <div className="card-header">
                <div className="protocol-name">Dreamcash</div>
                <div className="tier-badge tier-b">B+</div>
              </div>
              <div className="card-meta">
                <span className="tag">$DREAM Teased</span>
                <span className="tag">Mobile (HL)</span>
                <span className="tag">Q2-Q3 2026</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>Tether partnership = credibility. 1000 free points on signup. HIP-3 markets: TSLA, NVDA, US500. Double-stacks: HL points + Dream points.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Download app, claim 1000 free points</li>
                  <li>Trade HIP-3 equity perps (TSLA, NVDA, US500)</li>
                </ul>
              </div>
              <a href="https://dreamcash.app" target="_blank" rel="noreferrer" className="protocol-link">dreamcash.app</a>
            </div>

            <div className="protocol-card card-b">
              <div className="card-header">
                <div className="protocol-name">OpenSea ($SEA)</div>
                <div className="tier-badge tier-b">B+</div>
              </div>
              <div className="card-meta">
                <span className="tag tag-green">50% Community Confirmed</span>
                <span className="tag">Multi-chain</span>
                <span className="tag">Q1 2026 IMMINENT</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>50% community allocation confirmed. Voyages XP system live now. Q1 2026 TGE = act immediately. CEO confirmed it publicly.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Complete Voyages XP tasks NOW (Q1 2026)</li>
                  <li>Buy/sell NFTs (any chain)</li>
                  <li>List NFTs for sale to build volume</li>
                </ul>
              </div>
              <a href="https://opensea.io" target="_blank" rel="noreferrer" className="protocol-link">opensea.io</a>
            </div>

            <div className="protocol-card card-b">
              <div className="card-header">
                <div className="protocol-name">Felix Protocol</div>
                <div className="tier-badge tier-b">B+</div>
              </div>
              <div className="card-meta">
                <span className="tag">Points Live</span>
                <span className="tag">HyperEVM</span>
                <span className="tag">Q2-Q3 2026</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>CDP stablecoin (feUSD) on HyperEVM. Mint feUSD against HYPE → trade Felix HIP-3 equity perps. Stacks Felix + HL points simultaneously.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Deposit HYPE → mint feUSD</li>
                  <li>Use feUSD to trade HIP-3 perps (gold, silver, SPX)</li>
                  <li>LP feUSD on KittenSwap for gauge rewards</li>
                </ul>
              </div>
              <a href="https://felix.finance" target="_blank" rel="noreferrer" className="protocol-link">felix.finance</a>
            </div>

            <div className="protocol-card card-b">
              <div className="card-header">
                <div className="protocol-name">HyperLend</div>
                <div className="tier-badge tier-b">B+</div>
              </div>
              <div className="card-meta">
                <span className="tag">Points Live</span>
                <span className="tag">HyperEVM</span>
                <span className="tag">Q2-Q3 2026</span>
              </div>
              <p style={{fontSize:'0.85rem'}}>Aave of HyperEVM. Supply + borrow = dual points. Caps filling fast. Deposit stHYPE → borrow USDC → deploy elsewhere.</p>
              <div className="card-actions">
                <ul className="action-list">
                  <li>Deposit USDT/ETH/stHYPE as collateral</li>
                  <li>Borrow stables against collateral</li>
                  <li>Deploy borrowed stables into KittenSwap LPs</li>
                </ul>
              </div>
              <a href="https://hyperlend.finance" target="_blank" rel="noreferrer" className="protocol-link">hyperlend.finance</a>
            </div>

          </div>
        </div>

        {/* 04 — CAPITAL ALLOCATION */}
        <div className="section">
          <div className="section-title">04 — Capital Allocation ($10K Base)</div>
          <h2>How to Deploy $10K</h2>
          <p>Assuming $10,000 USDC/USDT starting capital, optimized for point accumulation + yield generation with minimal directional risk.</p>
          <br />
          <div className="alloc-bars">
            <div className="alloc-row">
              <div className="alloc-label">Nado NLP Vault (USDT0)</div>
              <div className="alloc-bar-wrap"><div className="alloc-bar" style={{width:'30%',background:'var(--s-plus)'}} /></div>
              <div className="alloc-pct">30% — $3,000</div>
            </div>
            <div className="alloc-row">
              <div className="alloc-label">Nado Active Trading</div>
              <div className="alloc-bar-wrap"><div className="alloc-bar" style={{width:'20%',background:'var(--s-plus)'}} /></div>
              <div className="alloc-pct">20% — $2,000</div>
            </div>
            <div className="alloc-row">
              <div className="alloc-label">Tydro (Ink L2, idle USDC)</div>
              <div className="alloc-bar-wrap"><div className="alloc-bar" style={{width:'15%',background:'var(--s-tier)'}} /></div>
              <div className="alloc-pct">15% — $1,500</div>
            </div>
            <div className="alloc-row">
              <div className="alloc-label">Polymarket (POLY farming)</div>
              <div className="alloc-bar-wrap"><div className="alloc-bar" style={{width:'5%',background:'var(--s-tier)'}} /></div>
              <div className="alloc-pct">5% — $500</div>
            </div>
            <div className="alloc-row">
              <div className="alloc-label">Extended XVS Vault</div>
              <div className="alloc-bar-wrap"><div className="alloc-bar" style={{width:'10%',background:'var(--a-tier)'}} /></div>
              <div className="alloc-pct">10% — $1,000</div>
            </div>
            <div className="alloc-row">
              <div className="alloc-label">HyperLend (stHYPE collateral)</div>
              <div className="alloc-bar-wrap"><div className="alloc-bar" style={{width:'10%',background:'var(--a-tier)'}} /></div>
              <div className="alloc-pct">10% — $1,000</div>
            </div>
            <div className="alloc-row">
              <div className="alloc-label">Base / MegaETH activity</div>
              <div className="alloc-bar-wrap"><div className="alloc-bar" style={{width:'5%',background:'var(--a-tier)'}} /></div>
              <div className="alloc-pct">5% — $500</div>
            </div>
            <div className="alloc-row">
              <div className="alloc-label">KittenSwap LP + NFT</div>
              <div className="alloc-bar-wrap"><div className="alloc-bar" style={{width:'5%',background:'var(--b-tier)'}} /></div>
              <div className="alloc-pct">5% — $500</div>
            </div>
          </div>
        </div>

        {/* 05 — WEEKLY SCHEDULE */}
        <div className="section">
          <div className="section-title">05 — Weekly Farming Routine</div>
          <h2>The Weekly Stack</h2>
          <p style={{marginBottom:'1.5rem'}}>Time budget: ~30-60 minutes per week total (most positions are passive).</p>
          <div className="schedule-grid">
            <div className="day-card"><div className="day-name">MON</div><div className="day-tasks">Check Nado positions. Rebalance grid if needed. Verify Tydro supply active.</div></div>
            <div className="day-card"><div className="day-name">TUE</div><div className="day-tasks">Polymarket: place 2-3 bets on high-probability markets. Check Extended.</div></div>
            <div className="day-card"><div className="day-name">WED</div><div className="day-tasks">HyperEVM: vote on KittenSwap gauges. Check Felix/HyperLend positions.</div></div>
            <div className="day-card"><div className="day-name">THU</div><div className="day-tasks">Unit: execute one spot trade on HL (uBTC or uETH). Check Base activity.</div></div>
            <div className="day-card"><div className="day-name">FRI</div><div className="day-tasks">Check Nado Points page (distributed Fridays). Record weekly totals in tracker.</div></div>
            <div className="day-card"><div className="day-name">SAT</div><div className="day-tasks">Research: scan Twitter for new Ink/HL ecosystem protocols. Update watchlist.</div></div>
            <div className="day-card"><div className="day-name">SUN</div><div className="day-tasks">Monthly rebalance (1x/month): adjust allocations based on new intel.</div></div>
          </div>
        </div>

        {/* 06 — RISK */}
        <div className="section">
          <div className="section-title">06 — Risk Framework</div>
          <div className="risk-grid">
            <div className="risk-card risk-low">
              <div className="risk-title">Low Risk — Idle USDC Deployment</div>
              <div className="risk-text">Tydro supply, NLP vault, Extended XVS vault, HyperLend stable supply. No price exposure. Returns: lending APY + points. Worst case: smart contract bug.</div>
            </div>
            <div className="risk-card risk-low">
              <div className="risk-title">Low Risk — Volume Farming</div>
              <div className="risk-text">Nado grid (XAUTUSDT0 hedged), Polymarket high-probability bets. Expected loss: grid fees + tiny bet losses. Offset by: funding income, lending APY on NLP.</div>
            </div>
            <div className="risk-card risk-med">
              <div className="risk-title">Medium Risk — HYPE Exposure</div>
              <div className="risk-text">KittenSwap LP, Felix CDP, HypurrFi loops. Liquidation risk if HYPE drops significantly. Mitigation: delta-neutral (spot HYPE long + perp short), monitor LTV ratios.</div>
            </div>
            <div className="risk-card risk-med">
              <div className="risk-title">Medium Risk — Airdrop Dilution</div>
              <div className="risk-text">Farming competition increases over time. Early positions (before this guide spreads) are most valuable. $INK and $POLY are still relatively uncrowded on the farming meta.</div>
            </div>
            <div className="risk-card risk-high">
              <div className="risk-title">High Risk — No Guarantee</div>
              <div className="risk-text">Airdrops can be cancelled, delayed, or geofenced. Philippines users may face eligibility restrictions on some platforms. Always verify T&Cs. Never deploy capital you can't afford to lock 6-12 months.</div>
            </div>
            <div className="risk-card risk-high">
              <div className="risk-title">High Risk — Sybil Bans</div>
              <div className="risk-text">AI-powered sybil detection is industry standard now. Multi-wallet farming, wash trading, and bot-like patterns WILL get you excluded. One wallet, genuine activity only.</div>
            </div>
          </div>
        </div>

        {/* 07 — QUICK REFERENCE */}
        <div className="section">
          <div className="section-title">07 — Quick Reference</div>
          <table className="strategy-table">
            <thead>
              <tr>
                <th>Protocol</th>
                <th>Token</th>
                <th>TGE</th>
                <th>Min Capital</th>
                <th>Weekly Time</th>
                <th>Yield While Farming</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Nado DEX</strong></td><td>$INK (confirmed)</td><td>Q1-Q2 2026</td><td>$500 USDT0</td><td>~15min (grid bot)</td><td>Grid + NLP yield</td><td><a href="https://nado.xyz" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>nado.xyz ↗</a></td></tr>
              <tr><td><strong>Tydro</strong></td><td>$INK (confirmed)</td><td>Q1-Q2 2026</td><td>$100</td><td>~5min</td><td>Lending APY</td><td><a href="https://tydro.xyz" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>tydro.xyz ↗</a></td></tr>
              <tr><td><strong>Velodrome (Ink)</strong></td><td>$INK (confirmed)</td><td>Q1-Q2 2026</td><td>$200</td><td>~10min</td><td>LP fees</td><td><a href="https://velodrome.finance" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>velodrome.finance ↗</a></td></tr>
              <tr><td><strong>Polymarket</strong></td><td>$POLY (confirmed)</td><td>Q2-Q3 2026</td><td>$50</td><td>~15min</td><td>Prediction winnings</td><td><a href="https://polymarket.com" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>polymarket.com ↗</a></td></tr>
              <tr><td><strong>Hyperliquid</strong></td><td>HYPE S2 (unconfirmed)</td><td>TBD</td><td>$500</td><td>~15min</td><td>Funding (delta-neutral)</td><td><a href="https://app.hyperliquid.xyz" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>app.hyperliquid.xyz ↗</a></td></tr>
              <tr><td><strong>Unit</strong></td><td>$UNIT (ticker secured)</td><td>Q2-Q3 2026</td><td>0.002 BTC</td><td>~10min</td><td>Collateral yield on HL</td><td><a href="https://app.hyperunit.xyz" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>app.hyperunit.xyz ↗</a></td></tr>
              <tr><td><strong>Extended DEX</strong></td><td>Token (30% confirmed)</td><td>Q2 2026</td><td>$500</td><td>~10min</td><td>XVS vault APY</td><td><a href="https://extended.xyz" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>extended.xyz ↗</a></td></tr>
              <tr><td><strong>KittenSwap</strong></td><td>Token (30% confirmed)</td><td>Q2-Q3 2026</td><td>$200 HYPE</td><td>~10min</td><td>LP fees + veCATS</td><td><a href="https://kittenswap.finance" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>kittenswap.finance ↗</a></td></tr>
              <tr><td><strong>TreadFi</strong></td><td>TBD</td><td>Q2-Q3 2026</td><td>$100</td><td>~5min</td><td>Bot strategy returns</td><td><a href="https://treadfi.xyz" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>treadfi.xyz ↗</a></td></tr>
              <tr><td><strong>Dexari</strong></td><td>$DEXARI</td><td>Q2-Q3 2026</td><td>$0</td><td>~5min</td><td>Same as HL</td><td><a href="https://dexari.io" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>dexari.io ↗</a></td></tr>
              <tr><td><strong>OpenSea</strong></td><td>$SEA (50% confirmed)</td><td>Q1 2026</td><td>Gas only</td><td>~10min</td><td>NFT resale</td><td><a href="https://opensea.io" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>opensea.io ↗</a></td></tr>
              <tr><td><strong>MegaETH</strong></td><td>TBD</td><td>Q2 2026</td><td>$50 ETH</td><td>~10min</td><td>DeFi protocols</td><td><a href="https://megaeth.com" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>megaeth.com ↗</a></td></tr>
              <tr><td><strong>Base L2</strong></td><td>TBD (highest upside)</td><td>2026 TBD</td><td>$100 ETH</td><td>~10min</td><td>Aerodrome LP + Aave</td><td><a href="https://base.org" target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>base.org ↗</a></td></tr>
            </tbody>
          </table>
        </div>

        <footer>
          Generated Feb 18, 2026 · Not financial advice · DYOR · All airdrops are speculative
        </footer>
      </div>
    </div>
  );
}
