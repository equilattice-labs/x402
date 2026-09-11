<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  Activity, ArrowRight, BadgeCheck, BookOpen, CheckCircle2, CircleAlert,
  ExternalLink, Menu, Radar, ShieldCheck, Sparkles, Wallet, X,
} from 'lucide-vue-next'
import { connectWallet, getRegistry } from './chain'

const connected = ref(false)
const address = ref('')
const walletError = ref('')
const registrySignals = ref(null)
const reputationPoints = ref(null)
const menuOpen = ref(false)
const visible = ref(new Set())
let observer

const signals = [
  { ticker: 'NOVA', name: 'Nova Settlement', score: 78, heat: 'Rising', trend: '+18.4%', holders: '1,284', evidence: 12, color: '#b7f34a', bars: [22, 35, 30, 48, 54, 70, 65, 83] },
  { ticker: 'LOOP', name: 'Loop Markets', score: 72, heat: 'Steady', trend: '+9.7%', holders: '842', evidence: 9, color: '#5ee7e7', bars: [35, 44, 38, 52, 46, 58, 64, 69] },
  { ticker: 'KITE', name: 'Kite Social', score: 66, heat: 'Watching', trend: '+4.2%', holders: '2,106', evidence: 7, color: '#ffca5c', bars: [46, 40, 58, 55, 48, 62, 60, 67] },
]

const steps = [
  { n: '01', title: 'Discover the warm middle', copy: 'Momentum with room to grow: active enough to matter, early enough to research.' },
  { n: '02', title: 'Inspect the evidence', copy: 'Liquidity, holder breadth, builder activity and contract risks in one source-linked card.' },
  { n: '03', title: 'Build portable reputation', copy: 'Useful research earns non-transferable reputation. Quality compounds; hype expires.' },
]

const shortAddress = computed(() => address.value ? `${address.value.slice(0, 6)}…${address.value.slice(-4)}` : 'Connect wallet')

async function handleConnect() {
  walletError.value = ''
  try {
    const wallet = await connectWallet()
    address.value = wallet.address
    connected.value = true
    const registry = getRegistry(wallet.provider)
    if (registry) {
      registrySignals.value = Number(await registry.totalSignals())
      reputationPoints.value = Number(await registry.reputation(wallet.address))
    }
  } catch (error) {
    walletError.value = error?.shortMessage || error?.message || 'Wallet connection failed.'
  }
}

function observeSections() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.value = new Set([...visible.value, entry.target.id])
    })
  }, { threshold: 0.18 })
  document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
}

onMounted(observeSections)
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <main>
    <header class="nav-shell">
      <a class="wordmark" href="#top" aria-label="EarlyCove home">
        <img src="/brand-mark.svg" alt="" />
        <span>EarlyCove</span>
      </a>
      <nav :class="{ open: menuOpen }">
        <a href="#radar" @click="menuOpen = false">Radar</a>
        <a href="#method" @click="menuOpen = false">Method</a>
        <a href="#reputation" @click="menuOpen = false">Reputation</a>
        <a href="https://docs.robinhood.com/chain" target="_blank" rel="noreferrer">Robinhood Chain <ExternalLink :size="14" /></a>
      </nav>
      <div class="nav-actions">
        <button class="wallet-button" type="button" @click="handleConnect">
          <CheckCircle2 v-if="connected" :size="17" />
          <Wallet v-else :size="17" />
          {{ shortAddress }}
        </button>
        <button class="menu-button" type="button" aria-label="Toggle navigation" @click="menuOpen = !menuOpen">
          <X v-if="menuOpen" :size="20" /><Menu v-else :size="20" />
        </button>
      </div>
    </header>

    <section id="top" class="hero">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="pulse-field" aria-hidden="true">
        <span v-for="i in 18" :key="i" :style="{ '--i': i }"></span>
      </div>
      <div class="hero-copy">
        <div class="eyebrow"><span></span> Live on Robinhood Chain Testnet</div>
        <h1>Find the signal<br /><em>before the swarm.</em></h1>
        <p>EarlyCove turns early on-chain momentum into evidence you can inspect—not hype you have to trust.</p>
        <div class="hero-actions">
          <a class="primary-button" href="#radar">Open the radar <ArrowRight :size="18" /></a>
          <a class="text-button" href="#method"><BookOpen :size="17" /> Read the method</a>
        </div>
        <p v-if="walletError" class="wallet-error"><CircleAlert :size="15" /> {{ walletError }}</p>
      </div>
      <div class="hero-stats" aria-label="Network statistics">
        <div><small>NETWORK</small><strong>Robinhood</strong></div>
        <div><small>SIGNALS TRACKED</small><strong>{{ registrySignals ?? '184' }}</strong></div>
        <div><small>EVIDENCE LINKS</small><strong>2,916</strong></div>
        <div><small>REFRESH</small><strong>12 sec</strong></div>
      </div>
    </section>

    <section id="radar" class="section radar-section" data-reveal :class="{ revealed: visible.has('radar') }">
      <div class="section-heading">
        <div><span class="kicker">THE WARM MIDDLE</span><h2>Momentum, without<br />the stampede.</h2></div>
        <p>Projects shown here sit between obscurity and peak attention. Every score is time-decayed, risk-capped, and linked to public evidence.</p>
      </div>

      <div class="radar-toolbar">
        <div class="live-label"><span></span> Live radar</div>
        <div class="filters" aria-label="Signal filters">
          <button class="active">All</button><button>DeFi</button><button>Social</button><button>Infra</button>
        </div>
        <span class="updated">Updated 8s ago</span>
      </div>

      <div class="signal-table">
        <article v-for="signal in signals" :key="signal.ticker" class="signal-row">
          <div class="project-cell"><span class="token-icon" :style="{ color: signal.color }">{{ signal.ticker[0] }}</span><div><strong>{{ signal.name }}</strong><small>${{ signal.ticker }} · Robinhood</small></div></div>
          <div class="score-cell"><span class="score-ring" :style="{ '--score': signal.score, '--ring': signal.color }">{{ signal.score }}</span><div><small>SIGNAL SCORE</small><strong>{{ signal.heat }}</strong></div></div>
          <div class="chart-cell" aria-label="Recent momentum chart"><i v-for="(bar, index) in signal.bars" :key="index" :style="{ height: `${bar}%`, background: signal.color }"></i></div>
          <div class="metric"><small>7D VELOCITY</small><strong class="positive">{{ signal.trend }}</strong></div>
          <div class="metric"><small>HOLDERS</small><strong>{{ signal.holders }}</strong></div>
          <div class="evidence"><BadgeCheck :size="16" /> {{ signal.evidence }} sources</div>
          <button class="icon-button" :aria-label="`Open ${signal.name}`"><ArrowRight :size="18" /></button>
        </article>
      </div>
      <div class="demo-note"><ShieldCheck :size="16" /> {{ registrySignals === null ? 'Preview data for product demonstration. Live indexer activates at public beta.' : `Live registry connected · ${registrySignals} signals · ${reputationPoints} reputation points` }}</div>
    </section>

    <section id="method" class="section method-section" data-reveal :class="{ revealed: visible.has('method') }">
      <div class="method-intro">
        <span class="kicker">HOW SIGNAL BECOMES TRUST</span>
        <h2>Research that<br />survives the scroll.</h2>
        <p>EarlyCove makes every claim inspectable. Sources stay attached, scores decay with time, and critical risks override momentum.</p>
        <div class="method-badges"><span><ShieldCheck :size="16" /> Non-custodial</span><span><Activity :size="16" /> Time-decayed</span><span><BadgeCheck :size="16" /> Source-linked</span></div>
      </div>
      <div class="score-visual">
        <div class="score-center"><Radar :size="29" /><strong>74</strong><span>SIGNAL SCORE</span></div>
        <div class="orbit orbit-one"><span>Velocity</span><b>81</b></div>
        <div class="orbit orbit-two"><span>Breadth</span><b>69</b></div>
        <div class="orbit orbit-three"><span>Liquidity</span><b>76</b></div>
        <div class="orbit orbit-four"><span>Evidence</span><b>72</b></div>
      </div>
    </section>

    <section id="reputation" class="section reputation-section" data-reveal :class="{ revealed: visible.has('reputation') }">
      <div class="section-heading compact">
        <div><span class="kicker">THE CONTRIBUTOR LOOP</span><h2>Good research<br />compounds.</h2></div>
        <p>Reputation is earned by being useful early—not by being loud. It cannot be bought or transferred.</p>
      </div>
      <div class="step-grid">
        <article v-for="step in steps" :key="step.n"><span>{{ step.n }}</span><div class="step-icon"><Sparkles v-if="step.n === '01'" /><ShieldCheck v-else-if="step.n === '02'" /><BadgeCheck v-else /></div><h3>{{ step.title }}</h3><p>{{ step.copy }}</p></article>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-rings" aria-hidden="true"></div>
      <span class="kicker">ROBINHOOD CHAIN · TESTNET</span>
      <h2>Bring your curiosity.<br /><em>Leave with evidence.</em></h2>
      <button class="primary-button" type="button" @click="handleConnect"><Wallet :size="18" /> {{ connected ? shortAddress : 'Connect to enter' }}</button>
    </section>

    <footer>
      <div class="footer-brand"><img src="/brand-mark.svg" alt="" /><div><strong>EarlyCove</strong><span>Find the signal before the swarm.</span></div></div>
      <div class="footer-links"><a href="#method">Methodology</a><a href="https://x.com/earlycove">X / Twitter</a><a href="https://explorer.testnet.chain.robinhood.com">Explorer</a></div>
      <p>Research infrastructure, not financial advice. © 2026 EarlyCove.</p>
    </footer>
  </main>
</template>
