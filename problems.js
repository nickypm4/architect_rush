// ============================================================================
// ICON & METADATA REGISTRY (T)
// ============================================================================
export const T = {
  // Compute
  ec2:     ['EC2 Instance',                 '#ED7100', 'EC2'],
  asg:     ['Auto Scaling Group',          '#ED7100', 'ASG'],
  lt:      ['Launch Template',             '#ED7100', 'LT'],
  spot:    ['Spot Instances',              '#ED7100', 'SPT'],
  od:      ['On-Demand Base',              '#ED7100', 'OD'],
  pg:      ['Cluster Placement Group',     '#ED7100', 'PG'],
  efa:     ['Elastic Fabric Adapter',      '#ED7100', 'EFA'],

  // Core Networking
  vpc:     ['VPC',                         '#8C4FFF', 'VPC'],
  pub:     ['Public Subnet',               '#7AA116', 'PUB'],
  priv:    ['Private Subnet',              '#3F8624', 'PRV'],
  igw:     ['Internet Gateway',            '#8C4FFF', 'IGW'],
  nat:     ['NAT Gateway',                 '#8C4FFF', 'NAT'],
  eigw:    ['Egress-Only IGW',             '#8C4FFF', 'EIG'],
  rtb:     ['Route Table',                 '#8C4FFF', 'RT'],
  eip:     ['Elastic IP',                  '#8C4FFF', 'EIP'],
  fl:      ['VPC Flow Logs',               '#8C4FFF', 'VFL'],
  peer:    ['VPC Peering',                 '#8C4FFF', 'PCX'],
  vpce:    ['S3 Gateway Endpoint',         '#8C4FFF', 'VPE'],
  pl:      ['Interface Endpoint (PrivateLink)', '#8C4FFF', 'PL'],

  // Hybrid Networking
  vgw:     ['Virtual Private Gateway',     '#8C4FFF', 'VGW'],
  vpn:     ['Site-to-Site VPN',            '#8C4FFF', 'VPN'],
  dx:      ['Direct Connect',              '#8C4FFF', 'DX'],
  dxgw:    ['Direct Connect Gateway',      '#8C4FFF', 'DXG'],
  tgw:     ['Transit Gateway',             '#8C4FFF', 'TGW'],

  // Load Balancing, DNS & Edge
  alb:     ['Application Load Balancer',   '#8C4FFF', 'ALB'],
  nlb:     ['Network Load Balancer',       '#8C4FFF', 'NLB'],
  gwlb:    ['Gateway Load Balancer',       '#8C4FFF', 'GLB'],
  tg:      ['Target Group',                '#8C4FFF', 'TG'],
  r53:     ['Route 53',                    '#8C4FFF', 'R53'],
  r53r:    ['Resolver Inbound Endpoint',   '#8C4FFF', 'RSV'],
  r53out:  ['Resolver Outbound Endpoint',  '#8C4FFF', 'RSO'],
  phz:     ['Private Hosted Zone',         '#8C4FFF', 'PHZ'],
  hc:      ['Route 53 Health Check',       '#8C4FFF', 'HC'],
  cf:      ['CloudFront',                  '#8C4FFF', 'CF'],
  ga:      ['Global Accelerator',          '#8C4FFF', 'GA'],
  cff:     ['CloudFront Functions',        '#8C4FFF', 'CFF'],
  lbe:     ['Lambda@Edge',                 '#ED7100', 'L@E'],

  // Storage & Database
  ebs:     ['EBS Volume',                  '#3F8624', 'EBS'],
  snap:    ['EBS Snapshot',                '#3F8624', 'SNP'],
  efs:     ['Amazon EFS',                  '#3F8624', 'EFS'],
  efsia:   ['EFS Infrequent Access',       '#3F8624', 'IA'],
  fsx:     ['FSx for Windows',             '#3F8624', 'FSx'],
  lus:     ['FSx for Lustre',              '#3F8624', 'LUS'],
  ontap:   ['FSx for NetApp ONTAP',        '#3F8624', 'ONT'],
  s3:      ['Amazon S3',                   '#3F8624', 'S3'],
  sgw:     ['Storage Gateway',             '#3F8624', 'SGW'],
  rds:     ['RDS Multi-AZ',               '#3F8624', 'RDS'],

  // Security, Monitoring & Governance
  sg:      ['Security Group',              '#DD344C', 'SG'],
  nacl:    ['Network ACL',                 '#DD344C', 'ACL'],
  waf:     ['AWS WAF',                     '#DD344C', 'WAF'],
  kms:     ['KMS Key',                     '#DD344C', 'KMS'],
  ram:     ['Resource Access Manager',     '#DD344C', 'RAM'],
  appl:    ['Firewall Appliance',          '#DD344C', 'FW'],
  cw:      ['CloudWatch Alarm',            '#DD344C', 'CW'],
  sqs:     ['Amazon SQS',                  '#ED7100', 'SQS'],

  // Actors & Outside World
  onprem:  ['Corporate Data Center',       '#5f6b7a', 'DC'],
  users:   ['Users / Clients',             '#5f6b7a', 'USR']
};

export const DOMAINS = {
  vpc:     { title: 'VPC & Core Networking',         icon: '🌐' },
  compute: { title: 'Compute & Elasticity',          icon: '⚡' },
  edge:    { title: 'Edge, DNS & Perimeter Security', icon: '🛡️' },
  storage: { title: 'Storage & Databases',           icon: '💾' },
  hybrid:  { title: 'Hybrid Cloud & Direct Connect', icon: '🏢' }
};

export const RANKS = [
  { minXp: 0,     title: 'Junior Cloud Architect',       badge: '🌱' },
  { minXp: 800,   title: 'Cloud Solutions Associate',    badge: '☁️' },
  { minXp: 2200,  title: 'Certified Solutions Architect',badge: '🏗️' },
  { minXp: 4500,  title: 'Senior Solutions Architect',   badge: '🎖️' },
  { minXp: 8000,  title: 'Principal Cloud Architect',    badge: '👑' },
  { minXp: 14000, title: 'Distinguished AWS Fellow',     badge: '🔮' }
];

// ============================================================================
// TOPOLOGY DIAGRAM CHALLENGES (D)
// ============================================================================
export const D = [
  {
    q: 'Highly available outbound IPv4 internet for private instances across two AZs without single points of failure.',
    n: { ec2: 2, priv: 2, nat: 2, pub: 2, igw: 1 },
    e: [['ec2', 'priv', 2], ['ec2', 'nat', 2], ['nat', 'pub', 2], ['nat', 'igw', 2]],
    cat: 'vpc', diff: 'medium',
    tip: 'NAT Gateways are AZ-scoped. High availability requires 1 NAT Gateway per AZ in a public subnet, each routed to an IGW, with each private subnet route table pointing 0.0.0.0/0 to its respective AZ’s NAT GW.'
  },
  {
    q: 'Standard secure 3-tier architecture: public internet users enter via an Internet Gateway to an Application Load Balancer in public subnets, routing to an Auto Scaling fleet in private subnets, querying a private Multi-AZ database.',
    n: { users: 1, igw: 1, pub: 1, alb: 1, asg: 1, ec2: 1, priv: 1, rds: 1 },
    e: [['users', 'igw'], ['igw', 'alb'], ['alb', 'pub'], ['alb', 'asg'], ['asg', 'priv'], ['asg', 'ec2'], ['ec2', 'rds'], ['rds', 'priv']],
    cat: 'vpc', diff: 'medium',
    tip: 'Public subnets host only the internet-facing ALB. Compute (EC2/ASG) and database (RDS Multi-AZ) remain in private subnets with strict security group isolation between tiers.'
  },
  {
    q: 'Accelerate a static web app globally while ensuring the S3 origin bucket is completely private and accessible exclusively through CloudFront.',
    n: { users: 1, cf: 1, s3: 1 },
    e: [['users', 'cf'], ['cf', 's3']],
    cat: 'edge', diff: 'easy',
    tip: 'CloudFront with Origin Access Control (OAC) prevents direct S3 bucket access. S3 bucket policy allows read access only to the CloudFront distribution principal.'
  },
  {
    q: 'Serve dynamic REST API endpoints from private instances via a load balancer, and serve static images/assets from an S3 bucket, through a single CDN distribution.',
    n: { users: 1, cf: 1, alb: 1, ec2: 1, s3: 1 },
    e: [['users', 'cf'], ['cf', 'alb'], ['cf', 's3'], ['alb', 'ec2']],
    cat: 'edge', diff: 'medium',
    tip: 'CloudFront behaviors allow path-pattern routing (e.g., /api/* to ALB origin, and default/* to S3 origin) under a single SSL certificate and domain name.'
  },
  {
    q: 'A global multiplayer UDP/TCP game requires 2 static Anycast IP addresses and instant failover to regional fleets behind high-throughput Layer 4 load balancers.',
    n: { users: 1, ga: 1, nlb: 2, ec2: 2 },
    e: [['users', 'ga'], ['ga', 'nlb', 2], ['nlb', 'ec2', 2]],
    cat: 'edge', diff: 'medium',
    tip: 'AWS Global Accelerator provides 2 static Anycast IPs, rides the AWS backbone, and supports TCP/UDP for fast failover to NLB endpoints. CloudFront only caches HTTP/HTTPS.'
  },
  {
    q: 'Transparently inspect all incoming internet traffic entering the VPC using a fleet of third-party firewall appliances before traffic reaches the workload.',
    n: { users: 1, igw: 1, gwlb: 1, appl: 2, ec2: 1 },
    e: [['users', 'igw'], ['igw', 'gwlb'], ['gwlb', 'appl', 2], ['gwlb', 'ec2']],
    cat: 'vpc', diff: 'hard',
    tip: 'Gateway Load Balancer (GWLB) operates at Layer 3/4 (GENEVE protocol on port 6081) to transparently route VPC traffic to inline virtual appliances without altering source IP headers.'
  },
  {
    q: 'EC2 instances in a private subnet must access Amazon S3 buckets privately, without using the internet, and at zero additional hourly cost.',
    n: { ec2: 1, priv: 1, rtb: 1, vpce: 1, s3: 1 },
    e: [['ec2', 'priv'], ['priv', 'rtb'], ['rtb', 'vpce'], ['vpce', 's3']],
    cat: 'vpc', diff: 'easy',
    tip: 'Gateway VPC Endpoints (for S3 and DynamoDB only) are completely free and route traffic through a VPC route table prefix list entry. Interface Endpoints (PrivateLink) incur hourly and data charges.'
  },
  {
    q: 'Private EC2 instances must push messages to Amazon SQS privately without an internet gateway, NAT gateway, or public IPs.',
    n: { ec2: 1, priv: 1, pl: 1, sqs: 1 },
    e: [['ec2', 'priv'], ['priv', 'pl'], ['pl', 'sqs']],
    cat: 'vpc', diff: 'medium',
    tip: 'SQS does not support Gateway Endpoints. An Interface VPC Endpoint (powered by AWS PrivateLink) creates an ENI inside your private subnet with a private IP.'
  },
  {
    q: 'A SaaS vendor in VPC 1 must expose its application service securely to customer consumers in VPC 2, where both VPCs share the exact same 10.0.0.0/16 CIDR.',
    n: { ec2: 1, nlb: 1, pl: 1, vpc: 2 },
    e: [['ec2', 'nlb'], ['nlb', 'vpc'], ['pl', 'vpc'], ['nlb', 'pl']],
    cat: 'vpc', diff: 'hard',
    tip: 'VPC Peering fails with overlapping CIDRs. AWS PrivateLink (NLB on the service provider side + Interface Endpoint on the consumer side) connects isolated services across overlapping IP ranges.'
  },
  {
    q: 'Connect three VPCs and an on-premises data center over VPN so all can communicate with each other, avoiding the operational complexity of a full-mesh peering topology.',
    n: { vpc: 3, tgw: 1, vpn: 1, onprem: 1 },
    e: [['vpc', 'tgw', 3], ['tgw', 'vpn'], ['vpn', 'onprem']],
    cat: 'hybrid', diff: 'medium',
    tip: 'Transit Gateway functions as a cloud router supporting transitive routing across thousands of VPCs and VPN/Direct Connect connections, eliminating the N(N-1)/2 mesh overhead of peering.'
  },
  {
    q: 'Connect two VPCs with non-overlapping CIDRs across two different AWS Regions privately and at the lowest possible data transfer cost, ensuring routing tables are properly configured.',
    n: { vpc: 2, peer: 1, rtb: 2 },
    e: [['vpc', 'peer', 2], ['vpc', 'rtb', 2]],
    cat: 'vpc', diff: 'easy',
    tip: 'Inter-Region VPC Peering is the simplest and most cost-effective way to link two VPCs directly. Both route tables must be explicitly updated with the peer’s CIDR.'
  },
  {
    q: 'Establish a single 10 Gbps Direct Connect physical connection from on-premises to access workloads hosted across VPCs located in two distinct AWS Regions.',
    n: { onprem: 1, dx: 1, dxgw: 1, vpc: 2 },
    e: [['onprem', 'dx'], ['dx', 'dxgw'], ['dxgw', 'vpc', 2]],
    cat: 'hybrid', diff: 'medium',
    tip: 'A Direct Connect Gateway (DXGW) is a global resource that links a Direct Connect connection (via Private VIFs) to Virtual Private Gateways in multiple AWS Regions.'
  },
  {
    q: 'Deploy high-availability hybrid connectivity to a VPC using a dedicated private link as primary, with an encrypted internet-based automatic failover link.',
    n: { onprem: 1, dx: 1, vpn: 1, vgw: 1, vpc: 1 },
    e: [['onprem', 'dx'], ['onprem', 'vpn'], ['dx', 'vgw'], ['vpn', 'vgw'], ['vgw', 'vpc']],
    cat: 'hybrid', diff: 'medium',
    tip: 'Direct Connect (primary) with Site-to-Site VPN (backup) attached to the same VGW delivers cost-effective resilience. For matching prefixes, AWS VPC route priority prefers propagated Direct Connect BGP routes over VPN routes.'
  },
  {
    q: 'Corporate policy mandates that all traffic traveling over a dedicated Direct Connect link into a VPC must be cryptographically encrypted in transit with IPsec.',
    n: { onprem: 1, dx: 1, vpn: 1, vgw: 1, vpc: 1 },
    e: [['onprem', 'dx'], ['dx', 'vpn'], ['vpn', 'vgw'], ['vgw', 'vpc']],
    cat: 'hybrid', diff: 'hard',
    tip: 'Direct Connect is private but unencrypted by default. Establish a public VIF on Direct Connect and run an IPsec Site-to-Site VPN tunnel inside it to the VPC.'
  },
  {
    q: 'Interconnect two remote branch offices to each other and to an AWS VPC using existing internet connections, without backhauling traffic through corporate HQ.',
    n: { onprem: 2, vpn: 2, vgw: 1, vpc: 1 },
    e: [['onprem', 'vpn', 2], ['vpn', 'vgw', 2], ['vgw', 'vpc']],
    cat: 'hybrid', diff: 'hard',
    tip: 'AWS VPN CloudHub allows multiple Site-to-Site VPN connections to terminate on a single Virtual Private Gateway with BGP, enabling branch sites to communicate directly through AWS.'
  },
  {
    q: 'A central networking account owns the VPC and routing topology. Allow workload accounts in an AWS Organization to launch EC2 instances directly into the central private subnet.',
    n: { ram: 1, vpc: 1, priv: 1, ec2: 2 },
    e: [['ram', 'priv'], ['priv', 'vpc'], ['ec2', 'priv', 2]],
    cat: 'vpc', diff: 'medium',
    tip: 'AWS Resource Access Manager (RAM) shares subnets across an AWS Organization. Workload owners manage their instances, while networking admins retain control of VPC CIDRs, subnets, and route tables.'
  },
  {
    q: 'On-premises servers must resolve private domain names hosted in a Route 53 Private Hosted Zone over an existing hybrid VPN.',
    n: { onprem: 1, vpn: 1, vgw: 1, vpc: 1, r53r: 1, phz: 1 },
    e: [['onprem', 'vpn'], ['vpn', 'vgw'], ['vgw', 'vpc'], ['vpc', 'r53r'], ['vpc', 'phz']],
    cat: 'hybrid', diff: 'medium',
    tip: 'Route 53 Resolver Inbound Endpoints deliver IP addresses in your VPC for on-premises DNS forwarders to query private records in AWS Private Hosted Zones over VPN or Direct Connect.'
  },
  {
    q: 'EC2 instances in a VPC must query corporate internal domain names (corp.internal) hosted on data center DNS servers over a hybrid link.',
    n: { ec2: 1, vpc: 1, r53out: 1, vgw: 1, vpn: 1, onprem: 1 },
    e: [['ec2', 'vpc'], ['vpc', 'r53out'], ['vpc', 'vgw'], ['vgw', 'vpn'], ['vpn', 'onprem']],
    cat: 'hybrid', diff: 'medium',
    tip: 'Route 53 Resolver Outbound Endpoints and Resolver forwarding rules route DNS queries matching specific on-premises domains from AWS back to your data center DNS servers.'
  },
  {
    q: 'Protect an Application Load Balancer and its backend web instances against SQL injection and HTTP flood attacks directly at the AWS edge before traffic hits the VPC.',
    n: { users: 1, cf: 1, waf: 1, alb: 1, ec2: 1 },
    e: [['users', 'cf'], ['cf', 'waf'], ['cf', 'alb'], ['alb', 'ec2']],
    cat: 'edge', diff: 'medium',
    tip: 'AWS WAF attaches directly to CloudFront distributions to inspect, filter, and rate-limit HTTP/HTTPS traffic at edge locations worldwide, shielding the origin ALB and EC2 servers.'
  },
  {
    q: 'Direct web traffic to an Application Load Balancer, but automatically fail over DNS to a static error website hosted in Amazon S3 when ALB health checks fail.',
    n: { users: 1, r53: 1, hc: 1, alb: 1, s3: 1 },
    e: [['users', 'r53'], ['r53', 'alb'], ['r53', 's3'], ['hc', 'alb']],
    cat: 'edge', diff: 'medium',
    tip: 'Route 53 Failover routing requires a Health Check monitoring the primary ALB endpoint. If unhealthy, Route 53 routes incoming DNS queries to the secondary S3 website record.'
  },
  {
    q: 'Implement defense-in-depth in a public subnet: evaluate inbound traffic with a stateless network filter, then with a stateful host filter on the EC2 instance.',
    n: { pub: 1, nacl: 1, ec2: 1, sg: 1 },
    e: [['pub', 'nacl'], ['pub', 'ec2'], ['ec2', 'sg']],
    cat: 'vpc', diff: 'easy',
    tip: 'NACLs are stateless subnet-level firewalls evaluating numbered allow/deny rules. Security Groups are stateful ENI-level firewalls with allow-only rules.'
  },
  {
    q: 'Allow network administrators on the public internet to securely SSH into private application instances via a dedicated bastion host with a static public IP in a public subnet.',
    n: { users: 1, igw: 1, pub: 1, eip: 1, ec2: 2, priv: 1 },
    e: [['users', 'igw'], ['igw', 'ec2'], ['ec2', 'eip'], ['ec2', 'pub'], ['ec2', 'ec2'], ['ec2', 'priv']],
    cat: 'vpc', diff: 'medium',
    tip: 'The bastion EC2 host resides in the public subnet with an Elastic IP. The private instances’ security group permits SSH port 22 strictly from the bastion’s security group.'
  },
  {
    q: 'Two Linux EC2 instances in different Availability Zones require concurrent read-write access to a shared POSIX file system, secured by a dedicated security group.',
    n: { ec2: 2, efs: 1, sg: 1 },
    e: [['ec2', 'efs', 2], ['efs', 'sg'], ['ec2', 'sg', 2]],
    cat: 'storage', diff: 'easy',
    tip: 'Amazon EFS provides concurrent NFSv4 access across multiple AZs. EFS mount targets use security groups permitting inbound TCP port 2049 exclusively from the client instances.'
  },
  {
    q: 'Automatically move rarely accessed files on a shared Linux file system to a low-cost storage tier after 30 days of inactivity without disrupting client mount paths.',
    n: { ec2: 2, efs: 1, efsia: 1 },
    e: [['ec2', 'efs', 2], ['efs', 'efsia']],
    cat: 'storage', diff: 'easy',
    tip: 'EFS Lifecycle Management transparently transitions files unaccessed for N days to EFS Infrequent Access (IA), slashing storage costs while remaining accessible under the same POSIX mount.'
  },
  {
    q: 'Two Windows EC2 instances require a fully managed SMB shared file system integrated with Microsoft Active Directory and NTFS permissions.',
    n: { ec2: 2, fsx: 1 },
    e: [['ec2', 'fsx', 2]],
    cat: 'storage', diff: 'easy',
    tip: 'FSx for Windows File Server provides native SMB shares, Active Directory integration, and NTFS access control lists. EFS is POSIX/NFS for Linux only.'
  },
  {
    q: 'An HPC compute cluster requires a POSIX-compliant, sub-millisecond file system pre-loaded from an Amazon S3 dataset that can write back computation results.',
    n: { ec2: 2, lus: 1, s3: 1 },
    e: [['ec2', 'lus', 2], ['lus', 's3']],
    cat: 'storage', diff: 'medium',
    tip: 'FSx for Lustre is optimized for HPC and machine learning, offering native two-way synchronization with Amazon S3 data repositories and parallel processing throughput.'
  },
  {
    q: 'A tightly coupled scientific simulation requires OS-bypass networking and the absolute lowest inter-node network latency between EC2 instances.',
    n: { ec2: 2, pg: 1, efa: 2 },
    e: [['ec2', 'pg', 2], ['ec2', 'efa', 2]],
    cat: 'compute', diff: 'hard',
    tip: 'An Elastic Fabric Adapter (EFA) provides OS-bypass capability for MPI workloads. Pairing EFA with a Cluster Placement Group ensures physical rack proximity with ultra-low latency.'
  },
  {
    q: 'On-premises applications requiring low-latency local NFS file access must store and retain their primary data in Amazon S3 buckets.',
    n: { onprem: 1, sgw: 1, s3: 1 },
    e: [['onprem', 'sgw'], ['sgw', 's3']],
    cat: 'storage', diff: 'easy',
    tip: 'AWS Storage Gateway (S3 File Gateway) caches active files locally on-premises via NFS/SMB while persisting objects directly in Amazon S3 for durable, cost-effective storage.'
  },
  {
    q: 'Migrate an existing unencrypted production EBS volume to an encrypted EBS volume using customer-managed AWS KMS keys without data loss.',
    n: { ec2: 1, ebs: 1, snap: 1, kms: 1 },
    e: [['ec2', 'ebs'], ['ebs', 'snap'], ['snap', 'kms']],
    cat: 'storage', diff: 'medium',
    tip: 'You cannot encrypt an existing EBS volume in place. Take a snapshot, copy the snapshot while enabling KMS encryption, and restore a new encrypted volume from that copy.'
  },
  {
    q: 'Decouple background worker EC2 instances from API web servers, scaling the worker Auto Scaling fleet dynamically based on pending message volume.',
    n: { sqs: 1, cw: 1, asg: 1, ec2: 2 },
    e: [['ec2', 'sqs', 2], ['cw', 'sqs'], ['cw', 'asg'], ['asg', 'ec2', 2]],
    cat: 'compute', diff: 'medium',
    tip: 'Worker instances scale horizontally using CloudWatch Alarms monitoring the SQS metric ApproximateNumberOfMessagesVisible, decoupling workload surges from processing capacity.'
  },
  {
    q: 'Minimize compute expenses for a stateless web application by maintaining a baseline of guaranteed On-Demand instances combined with Spot Instances for demand spikes.',
    n: { alb: 1, asg: 1, od: 1, spot: 1 },
    e: [['alb', 'asg'], ['asg', 'od'], ['asg', 'spot']],
    cat: 'compute', diff: 'medium',
    tip: 'An ASG Mixed Instances Policy mixes On-Demand instances (guaranteed baseline availability) with Spot Instances (up to 90% discount for burst capacity) across multiple instance types.'
  },
  {
    q: 'Route global web users automatically to the AWS Region delivering the fastest response times, each running an independent Application Load Balancer and fleet.',
    n: { users: 1, r53: 1, alb: 2, ec2: 2 },
    e: [['users', 'r53'], ['r53', 'alb', 2], ['alb', 'ec2', 2]],
    cat: 'edge', diff: 'easy',
    tip: 'Route 53 Latency-Based Routing queries network latency measurements between client IPs and AWS Regions, routing users to the specific ALB target group with the lowest round-trip time.'
  },
  {
    q: 'Standardize EC2 instance configuration (AMI, instance type, and security groups) for an Auto Scaling Group launching web servers.',
    n: { lt: 1, asg: 1, ec2: 2 },
    e: [['lt', 'asg'], ['asg', 'ec2', 2]],
    cat: 'compute', diff: 'easy',
    tip: 'Launch Templates version and standardize EC2 configuration parameters for Auto Scaling Groups, replacing legacy Launch Configurations.'
  },
  {
    q: 'Allow EC2 instances in a private IPv6 subnet to initiate outbound IPv6 internet connections while blocking all unsolicited inbound IPv6 traffic from the internet.',
    n: { ec2: 1, priv: 1, rtb: 1, eigw: 1 },
    e: [['ec2', 'priv'], ['priv', 'rtb'], ['rtb', 'eigw']],
    cat: 'vpc', diff: 'easy',
    tip: 'Because all IPv6 addresses are globally routable, an Egress-Only Internet Gateway (EIGW) provides stateful outbound-only IPv6 internet access for private subnets.'
  },
  {
    q: 'Capture IP traffic metadata for all network interfaces in a VPC and archive the logs in Amazon S3 for security auditing and troubleshooting.',
    n: { vpc: 1, fl: 1, s3: 1 },
    e: [['vpc', 'fl'], ['fl', 's3']],
    cat: 'vpc', diff: 'easy',
    tip: 'VPC Flow Logs capture accepted and rejected IP traffic metadata at the VPC, subnet, or ENI level and can publish directly to Amazon S3 or CloudWatch Logs.'
  },
  {
    q: 'Route HTTP requests from an Application Load Balancer to a dedicated Target Group that health-checks and distributes traffic across backend EC2 instances.',
    n: { alb: 1, tg: 1, ec2: 2 },
    e: [['alb', 'tg'], ['tg', 'ec2', 2]],
    cat: 'edge', diff: 'easy',
    tip: 'ALB listeners forward traffic to Target Groups, which perform health checks and route requests to registered targets such as EC2 instances, IP addresses, or Lambda functions.'
  },
  {
    q: 'Execute sub-millisecond viewer-request URL rewrites and HTTP header manipulation at CloudFront edge locations before serving static content from S3.',
    n: { users: 1, cf: 1, cff: 1, s3: 1 },
    e: [['users', 'cf'], ['cf', 'cff'], ['cf', 's3']],
    cat: 'edge', diff: 'medium',
    tip: 'CloudFront Functions run lightweight JavaScript at edge locations with sub-millisecond startup for high-volume viewer request/response manipulation.'
  },
  {
    q: 'Run custom Node.js or Python compute logic at CloudFront edge locations to inspect and modify origin requests before forwarding them to an Application Load Balancer.',
    n: { users: 1, cf: 1, lbe: 1, alb: 1 },
    e: [['users', 'cf'], ['cf', 'lbe'], ['cf', 'alb']],
    cat: 'edge', diff: 'hard',
    tip: 'Lambda@Edge supports Node.js and Python, larger payloads, and origin-facing triggers (origin request/response), making it ideal for complex edge logic.'
  },
  {
    q: 'Migrate an enterprise NetApp NAS/SAN workload to AWS, providing EC2 instances with multi-protocol (NFS, SMB, and iSCSI) shared storage.',
    n: { ec2: 2, ontap: 1 },
    e: [['ec2', 'ontap', 2]],
    cat: 'storage', diff: 'medium',
    tip: 'Amazon FSx for NetApp ONTAP provides fully managed NetApp ONTAP file systems with multi-protocol access (NFS, SMB, iSCSI), SnapMirror, and storage efficiency.'
  }
];

// ============================================================================
// FIX THE BROKEN DIAGRAM CHALLENGES (FIX)
// Pre-placed nodes with broken or missing connections
// ============================================================================
export const FIX = [
  {
    q: '🛠️ Fix the broken architecture: Private instances cannot reach the IPv4 internet because outbound routing is pointing directly to the Internet Gateway.',
    n: { ec2: 1, priv: 1, nat: 1, pub: 1, igw: 1 },
    e: [['ec2', 'priv'], ['ec2', 'nat'], ['nat', 'pub'], ['nat', 'igw']],
    initialNodes: [
      { k: 'ec2', x: 25, y: 150 },
      { k: 'priv', x: 120, y: 150 },
      { k: 'nat', x: 220, y: 220 },
      { k: 'pub', x: 220, y: 60 },
      { k: 'igw', x: 340, y: 60 }
    ],
    initialEdges: [
      ['ec2', 'priv'],
      ['priv', 'igw'] // Defective: private subnet routed directly to IGW
    ],
    cat: 'vpc', diff: 'medium',
    tip: 'Private subnets cannot route directly to an IGW. Remove the direct link to IGW and connect the compute instance to a NAT Gateway in the public subnet, which in turn routes to the IGW.'
  },
  {
    q: '🛠️ Fix the broken architecture: External users cannot reach web servers because the Internet Gateway bypasses the Application Load Balancer and targets private instances directly.',
    n: { users: 1, igw: 1, pub: 1, alb: 1, asg: 1, ec2: 1, priv: 1 },
    e: [['users', 'igw'], ['igw', 'alb'], ['alb', 'pub'], ['alb', 'asg'], ['asg', 'priv'], ['asg', 'ec2']],
    initialNodes: [
      { k: 'users', x: 20, y: 150 },
      { k: 'igw', x: 110, y: 150 },
      { k: 'alb', x: 200, y: 40 },
      { k: 'pub', x: 200, y: 130 },
      { k: 'asg', x: 290, y: 150 },
      { k: 'ec2', x: 380, y: 150 },
      { k: 'priv', x: 290, y: 240 }
    ],
    initialEdges: [
      ['users', 'igw'],
      ['igw', 'ec2'], // Defective shortcut
      ['asg', 'ec2'],
      ['asg', 'priv'],
      ['alb', 'pub']
    ],
    cat: 'vpc', diff: 'medium',
    tip: 'Public internet traffic must route from the Internet Gateway into the public ALB, which forwards traffic into the private Auto Scaling tier.'
  },
  {
    q: '🛠️ Fix the broken architecture: EC2 instances are incurring high NAT Gateway data processing fees when accessing S3 buckets. Swap the path to use a free Gateway VPC Endpoint.',
    n: { ec2: 1, priv: 1, rtb: 1, vpce: 1, s3: 1 },
    e: [['ec2', 'priv'], ['priv', 'rtb'], ['rtb', 'vpce'], ['vpce', 's3']],
    initialNodes: [
      { k: 'ec2', x: 30, y: 150 },
      { k: 'priv', x: 120, y: 150 },
      { k: 'rtb', x: 210, y: 150 },
      { k: 'nat', x: 210, y: 50 }, // Rogue/costly node
      { k: 'vpce', x: 300, y: 150 },
      { k: 's3', x: 390, y: 150 }
    ],
    initialEdges: [
      ['ec2', 'priv'],
      ['priv', 'rtb'],
      ['rtb', 'nat'] // Defective: routing through paid NAT GW
    ],
    cat: 'vpc', diff: 'medium',
    tip: 'Remove the NAT Gateway and route table link to NAT. Connect the Route Table to the S3 Gateway Endpoint (free prefix list route) leading directly to S3.'
  },
  {
    q: '🛠️ Fix the broken architecture: On-premises network traffic is failing to reach the VPC because the hybrid link bypasses the Virtual Private Gateway.',
    n: { onprem: 1, vpn: 1, vgw: 1, vpc: 1 },
    e: [['onprem', 'vpn'], ['vpn', 'vgw'], ['vgw', 'vpc']],
    initialNodes: [
      { k: 'onprem', x: 30, y: 150 },
      { k: 'vpn', x: 130, y: 150 },
      { k: 'vgw', x: 230, y: 50 },
      { k: 'vpc', x: 330, y: 150 }
    ],
    initialEdges: [
      ['onprem', 'vpn'],
      ['vpn', 'vpc'] // Defective: VPN cannot terminate directly on VPC without VGW or TGW
    ],
    cat: 'hybrid', diff: 'easy',
    tip: 'A Site-to-Site VPN must terminate on an AWS target: either a Virtual Private Gateway (VGW) or Transit Gateway (TGW) attached to the VPC.'
  }
];

// ============================================================================
// SPOT THE SINGLE POINT OF FAILURE (SPOF)
// Real-world topologies with one architectural vulnerability
// ============================================================================
export const SPOF = [
  {
    q: 'Which component in this production topology represents a Single Point of Failure (SPOF)?',
    scenario: 'A high-traffic e-commerce portal processing customer orders across two Availability Zones.',
    components: [
      { title: 'Route 53 Multi-AZ Health Checks', desc: 'DNS queries routed across healthy regional endpoints', isSpof: false },
      { title: 'Single NAT Gateway in AZ-a', desc: 'EC2 instances in both AZ-a and AZ-b route outbound payment traffic through this single NAT Gateway', isSpof: true, reason: 'NAT Gateways are AZ-scoped. If AZ-a suffers a disruption, all instances in AZ-b lose outbound connectivity.' },
      { title: 'Auto Scaling Group in 2 AZs', desc: 'EC2 instances distributed across subnets in AZ-a and AZ-b', isSpof: false },
      { title: 'Amazon Aurora Multi-AZ Cluster', desc: 'Primary DB instance with automated failover replica in AZ-b', isSpof: false }
    ],
    cat: 'vpc', diff: 'easy',
    tip: 'NAT Gateways are Availability Zone redundant, not Region redundant. To eliminate the SPOF, deploy one NAT Gateway per AZ and point each private subnet route table to its local NAT Gateway.'
  },
  {
    q: 'Which component in this mission-critical financial system represents a Single Point of Failure (SPOF)?',
    scenario: 'Real-time financial transaction processor backed by relational database persistence.',
    components: [
      { title: 'Application Load Balancer across 3 AZs', desc: 'Distributes traffic evenly with target health verification', isSpof: false },
      { title: 'Fleet of EC2 Instances in an ASG', desc: 'Minimum 4 instances spanning 2 Availability Zones', isSpof: false },
      { title: 'Single-AZ RDS PostgreSQL Instance', desc: 'Standalone database instance running without a Multi-AZ standby replica', isSpof: true, reason: 'If the host or AZ fails, database operations cease until manual recovery or instance resurrection finishes.' },
      { title: 'AWS WAF on CloudFront Distribution', desc: 'Inspects and mitigates Layer 7 attacks at edge locations', isSpof: false }
    ],
    cat: 'storage', diff: 'easy',
    tip: 'A Single-AZ RDS deployment lacks automated synchronous replication. Enabling Multi-AZ provides automatic synchronous standby failover within 60–120 seconds.'
  },
  {
    q: 'Which hybrid connection component represents a Single Point of Failure (SPOF)?',
    scenario: 'Corporate headquarters connecting critical on-premises SAP ERP servers to AWS workloads.',
    components: [
      { title: 'Single 1 Gbps Direct Connect Connection', desc: 'Dedicated physical cross-connect fiber link with no secondary DX or VPN backup', isSpof: true, reason: 'Fiber cuts, device maintenance, or port failures on the single DX link sever all corporate hybrid connectivity.' },
      { title: 'Direct Connect Gateway (DXGW)', desc: 'Global AWS managed service linking Private VIFs across regions', isSpof: false },
      { title: 'Transit Gateway Attached to Multiple VPCs', desc: 'Redundant AWS-managed transit hub with high availability', isSpof: false },
      { title: 'Redundant Customer Gateways (CGWs)', desc: 'Dual physical routers deployed in corporate data center', isSpof: false }
    ],
    cat: 'hybrid', diff: 'medium',
    tip: 'AWS Well-Architected Framework requires redundant hybrid paths. Pair Direct Connect with an IPsec Site-to-Site VPN backup, or provision dual Direct Connect connections across diverse DX locations.'
  },
  {
    q: 'Which component in this storage architecture represents a Single Point of Failure (SPOF)?',
    scenario: 'Collaborative document-sharing portal mounted across multiple Linux application servers.',
    components: [
      { title: 'Application Load Balancer', desc: 'Internet-facing ALB deployed across multiple public subnets', isSpof: false },
      { title: 'Standalone EBS Volume Mounted via NFS Server', desc: 'Single EBS gp3 disk attached to one EC2 instance acting as an un-clustered NFS host', isSpof: true, reason: 'If this single EC2 host or volume encounters an outage, the shared file system becomes completely inaccessible.' },
      { title: 'Auto Scaling Group of Web Instances', desc: 'Dynamically scales based on average CPU utilization', isSpof: false },
      { title: 'Automated CloudWatch Alarm Monitoring', desc: 'Alerts operations when error rates exceed 2%', isSpof: false }
    ],
    cat: 'storage', diff: 'medium',
    tip: 'Standalone EBS volumes cannot be shared across multiple instances across AZs natively. Replace single NFS server instances with Amazon EFS, which natively replicates data across multiple AZs.'
  }
];

// ============================================================================
// 10-SECOND FLASH ROUNDS (FLASH)
// High-speed micro-decisions for rapid architecture reflex training
// ============================================================================
export const FLASH = [
  {
    q: 'Sub-millisecond latency for HPC cluster pre-loaded from an S3 dataset:',
    o: ['Amazon FSx for Lustre', 'Amazon Elastic File System (EFS)'],
    a: 0,
    cat: 'storage', diff: 'easy',
    tip: 'FSx for Lustre delivers sub-millisecond latencies and native synchronization with Amazon S3 data repositories.'
  },
  {
    q: 'Lowest possible inter-node network latency between tightly-coupled EC2 instances:',
    o: ['Cluster Placement Group', 'Spread Placement Group'],
    a: 0,
    cat: 'compute', diff: 'easy',
    tip: 'Cluster Placement Groups physically group instances inside the same rack/spine switch for high throughput and ultra-low latency.'
  },
  {
    q: 'Free private access to S3 from private subnets without NAT Gateway:',
    o: ['Gateway VPC Endpoint', 'Interface VPC Endpoint (PrivateLink)'],
    a: 0,
    cat: 'vpc', diff: 'easy',
    tip: 'Gateway VPC Endpoints for S3 and DynamoDB are completely free and route via VPC route table prefix lists.'
  },
  {
    q: 'Inspect original client IP address behind an Application Load Balancer:',
    o: ['X-Forwarded-For HTTP Header', 'Raw TCP Packet Header'],
    a: 0,
    cat: 'edge', diff: 'easy',
    tip: 'Because ALBs terminate the TCP connection, the real client IP is forwarded inside the X-Forwarded-For HTTP header.'
  },
  {
    q: 'Two static Anycast IPs and instant failover for UDP/TCP gaming traffic:',
    o: ['AWS Global Accelerator', 'Amazon CloudFront'],
    a: 0,
    cat: 'edge', diff: 'easy',
    tip: 'Global Accelerator provides 2 static Anycast IPs and accelerates both TCP and UDP traffic across the AWS global backbone.'
  },
  {
    q: 'Scale worker fleet dynamically based on backlog of unprocessed tasks:',
    o: ['SQS ApproximateNumberOfMessagesVisible', 'EC2 CPUUtilization Metric'],
    a: 0,
    cat: 'compute', diff: 'easy',
    tip: 'CPU utilization does not reflect queued work. ApproximateNumberOfMessagesVisible accurately reflects pending task volume.'
  },
  {
    q: 'Active-Active multi-region database with sub-second replication latency:',
    o: ['DynamoDB Global Tables', 'RDS PostgreSQL Multi-AZ'],
    a: 0,
    cat: 'storage', diff: 'easy',
    tip: 'DynamoDB Global Tables provide fully managed multi-region active-active read and write capabilities.'
  },
  {
    q: 'Encrypt an existing unencrypted production EBS volume without data loss:',
    o: ['Snapshot -> Encrypted Copy -> Restore', 'In-place KMS Encryption Toggle'],
    a: 0,
    cat: 'storage', diff: 'easy',
    tip: 'EBS volumes cannot be encrypted in place. Create a snapshot, copy it with KMS encryption enabled, and restore a new volume.'
  },
  {
    q: 'Fully managed SMB shared storage integrated with Microsoft Active Directory:',
    o: ['Amazon FSx for Windows File Server', 'Amazon EFS (POSIX File System)'],
    a: 0,
    cat: 'storage', diff: 'easy',
    tip: 'FSx for Windows supports native SMB, Active Directory integration, and Windows NTFS access controls.'
  },
  {
    q: 'Stateless subnet-level firewall evaluating numbered allow and deny rules:',
    o: ['Network ACL (NACL)', 'Security Group (SG)'],
    a: 0,
    cat: 'vpc', diff: 'easy',
    tip: 'NACLs are stateless, subnet-level, and evaluate ordered allow/deny rules. Security Groups are stateful and allow-only.'
  },
  {
    q: 'Interconnect 50 VPCs and on-premises data centers with transitive routing:',
    o: ['AWS Transit Gateway', 'Full-Mesh VPC Peering'],
    a: 0,
    cat: 'hybrid', diff: 'easy',
    tip: 'Transit Gateway eliminates the complex N(N-1)/2 mesh overhead of VPC peering by acting as a cloud router.'
  },
  {
    q: 'Inspect and filter SQL injection and HTTP floods directly at edge PoPs:',
    o: ['AWS WAF on CloudFront Distribution', 'Network ACL on VPC Subnet'],
    a: 0,
    cat: 'edge', diff: 'easy',
    tip: 'AWS WAF inspects Layer 7 HTTP payloads and can attach directly to CloudFront to block attacks before reaching AWS origins.'
  }
];

// ============================================================================
// EXAM DECISION QUESTIONS (Q)
// Balanced option lengths and realistic distractors
// ============================================================================
export const Q = [
  {
    q: 'How many usable IPv4 addresses are available in a /24 VPC subnet?',
    o: [
      '256 usable addresses (AWS reserves zero subnet host IPs)',
      '254 usable addresses (RFC 1918 standard network/broadcast)',
      '251 usable addresses (AWS strictly reserves five host IPs)',
      '250 usable addresses (AWS strictly reserves six host IPs)'
    ],
    a: [2],
    cat: 'vpc', diff: 'easy',
    tip: 'AWS reserves 5 IP addresses in every subnet: Network (.0), VPC Router (.1), Amazon DNS (.2), Future Use (.3), and Broadcast (.255).'
  },
  {
    q: 'What are the minimum and maximum allowable IPv4 CIDR prefix lengths for an Amazon VPC?',
    o: [
      '/8 minimum prefix length up to /24 maximum prefix length',
      '/16 minimum prefix length up to /28 maximum prefix length',
      '/16 minimum prefix length up to /32 maximum prefix length',
      '/20 minimum prefix length up to /28 maximum prefix length'
    ],
    a: [1],
    cat: 'vpc', diff: 'easy',
    tip: 'A VPC IPv4 CIDR block can be between /16 (65,536 addresses) and /28 (16 addresses).'
  },
  {
    q: 'An EC2 web server allows inbound port 443 in its Security Group, and the subnet NACL allows inbound port 443. However, web clients time out. What is missing?',
    o: [
      'Outbound rule for ephemeral client return ports (1024-65535) in the NACL',
      'Outbound rule for destination port 443 explicitly configured in the SG',
      'Elastic IP address allocated and attached directly to the subnet NACL',
      'Outbound NAT Gateway route configured inside the private route table'
    ],
    a: [0],
    cat: 'vpc', diff: 'medium',
    tip: 'Network ACLs are STATELESS. Response traffic returning to the client uses an ephemeral port (1024–65535) and must be explicitly allowed outbound in the NACL. Security Groups are stateful and track connections automatically.'
  },
  {
    q: 'What is the most secure and maintainable way to allow EC2 instances in an application tier to communicate with database instances in an RDS tier?',
    o: [
      'Authorize inbound traffic on database port 3306 from CIDR 0.0.0.0/0',
      'Authorize the Application Security Group ID as the source in the Database SG',
      'Add the private IP address of every application instance to the Database NACL',
      'Attach both tiers into a shared public subnet under the same Security Group'
    ],
    a: [1],
    cat: 'vpc', diff: 'easy',
    tip: 'Security Groups can reference other Security Group IDs as sources or destinations. When application instances scale out or change IPs, the database tier remains securely accessible without manual rule updates.'
  },
  {
    q: 'An Application Load Balancer terminates client HTTPS connections. How does the target application server inspect the client’s real IP address?',
    o: [
      'Inspect the source IPv4/IPv6 address from the incoming TCP packet header',
      'Inspect the original client IP preserved inside the X-Forwarded-For header',
      'Inspect the domain name and target host configured in the HTTP Host header',
      'Inspect the Layer 2 physical MAC address embedded in Proxy Protocol v1'
    ],
    a: [1],
    cat: 'edge', diff: 'easy',
    tip: 'Because an ALB terminates the TCP/HTTP connection, backend targets see the ALB’s private IP as the network source. The original client IP is recorded in the X-Forwarded-For header.'
  },
  {
    q: 'You must redirect all HTTP requests on port 80 to HTTPS port 443 on an Application Load Balancer without changing application code. What is the optimal solution?',
    o: [
      'Deploy an auxiliary Network Load Balancer in front of the ALB to route ports',
      'Configure an HTTP listener redirect action directly on the Application Load Balancer',
      'Deploy Apache or Nginx rewrite directives on each backend EC2 application node',
      'Configure Route 53 Weighted DNS routing records to transform port numbers'
    ],
    a: [1],
    cat: 'edge', diff: 'easy',
    tip: 'ALB listeners natively support redirect actions (e.g., HTTP 301/302 from port 80 to 443) directly on the load balancer, requiring zero backend instance overhead.'
  },
  {
    q: 'Which load balancer behavior is enabled by default at NO extra charge for inter-AZ data transfer?',
    o: [
      'Cross-zone balancing on Network Load Balancers',
      'Cross-zone balancing on Application Load Balancers',
      'Cross-zone balancing on Gateway Load Balancers',
      'Stickiness routing on Classic Load Balancers'
    ],
    a: [1],
    cat: 'edge', diff: 'medium',
    tip: 'ALB has cross-zone load balancing enabled by default with zero inter-AZ data transfer fees. For NLB and GWLB, cross-zone is disabled by default and incurs inter-AZ data charges if enabled.'
  },
  {
    q: 'One Application Load Balancer hosts multiple websites with distinct domain names (api.corp.com and portal.corp.com), each requiring its own SSL certificate. What feature makes this possible?',
    o: [
      'Server Name Indication (SNI) on secure ALB listeners',
      'Target Group sticky session duration cookie policies',
      'Target Group deregistration delay connection draining',
      'Proxy Protocol v2 header injection on backend targets'
    ],
    a: [0],
    cat: 'edge', diff: 'medium',
    tip: 'Server Name Indication (SNI) allows an ALB to bind multiple SSL/TLS certificates to a single secure listener, serving the matching certificate based on the hostname requested in the TLS handshake.'
  },
  {
    q: 'You need to point the DNS zone apex (example.com) to an Application Load Balancer. Which Route 53 record type is required?',
    o: [
      'Standard CNAME record aliased to the ALB DNS name',
      'Alias A record mapping the apex domain to the ALB',
      'TXT verification record resolving to the ALB ARN',
      'PTR reverse-lookup record targeting the ALB VPC IP'
    ],
    a: [1],
    cat: 'edge', diff: 'easy',
    tip: 'DNS standards do not permit CNAME records at the zone apex. Route 53 provides Alias records (free of query charges) to map apex domains directly to AWS resources like ALBs and CloudFront.'
  },
  {
    q: 'Which Route 53 routing policy returns up to eight healthy IP records in response to a DNS query to provide client-side load balancing and health checks?',
    o: [
      'Simple routing policy with multiple resource values',
      'Multivalue Answer routing with health checks enabled',
      'Latency-based routing resolving to the nearest Region',
      'Geolocation routing matching client IP continent codes'
    ],
    a: [1],
    cat: 'edge', diff: 'medium',
    tip: 'Multivalue Answer routing responds to DNS queries with up to 8 randomly selected healthy resource records and integrates with Route 53 health checks, unlike Simple routing.'
  },
  {
    q: 'A legal compliance rule dictates that European users must be routed strictly to servers in Frankfurt, while US users must be routed to Virginia. Which Route 53 policy applies?',
    o: [
      'Latency routing evaluating round-trip network packet delays',
      'Geolocation routing evaluating client IP geographic locations',
      'Geoproximity routing using Route 53 Traffic Flow coordinates',
      'Weighted routing distributing requests across assigned ratios'
    ],
    a: [1],
    cat: 'edge', diff: 'easy',
    tip: 'Geolocation routing maps DNS traffic based on the geographic location of the client (continent, country, or US state), essential for compliance and localization. Geoproximity routes by distance and requires Traffic Flow bias.'
  },
  {
    q: 'Paid subscribers need temporary, secure access to hundreds of private video and data files distributed through CloudFront. What mechanism should you implement?',
    o: [
      'Generate an individual CloudFront Signed URL for each video file',
      'Issue CloudFront Signed Cookies to authorize the full directory',
      'Enable S3 bucket public read ACLs accompanied by signed presigned URLs',
      'Deploy Route 53 weighted record policies checking authentication tokens'
    ],
    a: [1],
    cat: 'edge', diff: 'medium',
    tip: 'Signed Cookies provide access to multiple restricted files (or an entire streaming directory) without changing individual URLs. Signed URLs are best for single file access.'
  },
  {
    q: 'You need to perform sub-millisecond URL rewrites and HTTP header manipulations on incoming viewer requests directly at edge locations with minimal cost and execution time. What should you use?',
    o: [
      'Deploy Lambda@Edge functions triggered on viewer request events',
      'Deploy CloudFront Functions executed natively at edge points of presence',
      'Deploy containerized reverse proxies inside ECS across primary AWS Regions',
      'Deploy API Gateway Edge-Optimized endpoints utilizing Lambda authorizers'
    ],
    a: [1],
    cat: 'edge', diff: 'easy',
    tip: 'CloudFront Functions execute lightweight JavaScript in sub-milliseconds at edge locations for viewer request/response events. Lambda@Edge supports Node/Python, larger payloads, and origin-facing events.'
  },
  {
    q: 'A steady 3-year production workload runs continuously across multiple EC2 instance families, different Regions, and may partially migrate to AWS Fargate. Which pricing model offers the highest discount and flexibility?',
    o: [
      'Standard EC2 Reserved Instances locked to an individual instance family',
      'Compute Savings Plans applying across families, Regions, and Fargate',
      'EC2 Instance Savings Plans locked to a single instance family and Region',
      'Dedicated Hosts committing to physical socket counts across three years'
    ],
    a: [1],
    cat: 'compute', diff: 'easy',
    tip: 'Compute Savings Plans offer up to 66% discounts and automatically apply across instance families, OS, AWS Regions, and also cover AWS Fargate and AWS Lambda.'
  },
  {
    q: 'A company needs dedicated physical hardware to satisfy regulatory per-core and per-socket software licensing agreements (BYOL). What EC2 purchase model is required?',
    o: [
      'Dedicated Instances guaranteeing single-tenant hypervisor isolation',
      'Dedicated Hosts granting full physical socket and core visibility',
      'Spot Instances requesting spare EC2 compute at steep discounts',
      'On-Demand Capacity Reservations reserving AZ capacity limits'
    ],
    a: [1],
    cat: 'compute', diff: 'medium',
    tip: 'EC2 Dedicated Hosts provide full visibility into socket and physical core counts, allowing you to use existing server-bound software licenses. Dedicated Instances only ensure single-tenant hardware isolation.'
  },
  {
    q: 'You need guaranteed EC2 compute capacity in a specific Availability Zone for a planned disaster recovery event next week, but do not want a 1-year or 3-year financial commitment. What do you provision?',
    o: [
      'On-Demand Capacity Reservation in the designated Availability Zone',
      'Regional Reserved Instance covering convertible instance classes',
      'Spot Fleet deploying diversified compute across multiple subnets',
      'Compute Savings Plan committing to a 1-year minimum hourly rate'
    ],
    a: [0],
    cat: 'compute', diff: 'medium',
    tip: 'On-Demand Capacity Reservations guarantee compute capacity in a specific AZ for any duration with no long-term commitment. You are billed at On-Demand rates until cancelled.'
  },
  {
    q: 'Seven mission-critical database instances must run on completely isolated physical hardware racks with separate power and network sources. Which placement group should you use?',
    o: [
      'Cluster placement group grouping nodes tightly in one physical rack',
      'Spread placement group isolating instances onto distinct hardware racks',
      'Partition placement group separating nodes into logical server sets',
      'Default placement launching instances across an Auto Scaling Group'
    ],
    a: [1],
    cat: 'compute', diff: 'easy',
    tip: 'Spread placement groups place each instance on distinct physical hardware racks (up to a strict limit of 7 instances per AZ) to eliminate correlated hardware failures.'
  },
  {
    q: 'Which storage option offers the lowest latency and highest random IOPS for temporary scratch files, caching, and buffers, where data loss upon instance stoppage is acceptable?',
    o: [
      'General Purpose SSD (gp3) EBS volume attached over NVMe bus',
      'EC2 Instance Store disks physically attached to the server chassis',
      'Amazon Elastic File System (EFS) mounted over network NFSv4',
      'Amazon S3 Express One Zone delivering consistent low latencies'
    ],
    a: [1],
    cat: 'storage', diff: 'easy',
    tip: 'EC2 Instance Store disks are physically attached NVMe/SATA SSDs that offer millions of IOPS and microsecond latencies, but storage is ephemeral (erased on stop or termination).'
  },
  {
    q: 'A slow-starting application takes 20 minutes to load machine learning models into RAM. You need to stop the instance overnight and resume its memory state immediately upon startup. What should you configure?',
    o: [
      'EC2 Hibernation dumping volatile memory onto the root EBS disk',
      'EC2 Stop and Start with gp3 volume snapshot retention policies',
      'EC2 Instance Reboot keeping hardware and hypervisor state alive',
      'Elastic Fabric Adapter allocating remote memory DMA pools'
    ],
    a: [0],
    cat: 'compute', diff: 'easy',
    tip: 'EC2 Hibernation saves volatile in-memory (RAM) state to the encrypted root EBS volume. Upon starting, the instance boots directly from the preserved RAM state.'
  },
  {
    q: 'A licensed third-party application is bound to a specific MAC address and private IPv4 address. When replacing the instance, how can the new instance inherit these attributes immediately in the same AZ?',
    o: [
      'Allocate a new Elastic IP and associate it with the replacement instance',
      'Detach the secondary Elastic Network Interface and attach it to the new node',
      'Create an AMI snapshot and deploy the replacement instance in that subnet',
      'Launch the replacement instance into the identical Cluster Placement Group'
    ],
    a: [1],
    cat: 'vpc', diff: 'medium',
    tip: 'An Elastic Network Interface (ENI) retains its private IP, MAC address, and security groups. It can be dynamically detached from a failed instance and attached to another instance in the same AZ.'
  },
  {
    q: 'You must run a custom log-collection script on EC2 instances to upload unsaved telemetry to S3 before an Auto Scaling group terminates them during a scale-in event. What feature should you implement?',
    o: [
      'Configure an ASG Cooldown Period to delay new scaling actions',
      'Attach an ASG Lifecycle Hook to pause instances in terminating wait',
      'Deploy a Target Tracking scaling policy tied to memory metrics',
      'Schedule a CloudWatch Synthetic Canary to poll instance states'
    ],
    a: [1],
    cat: 'compute', diff: 'medium',
    tip: 'Auto Scaling Lifecycle Hooks pause instance termination (or launch), placing the instance in a Pending:Wait or Terminating:Wait state so custom cleanup scripts or log drains can complete.'
  },
  {
    q: 'You need an Auto Scaling policy that automatically acts like a thermostat to keep average fleet CPU utilization close to 45%. Which policy type should you select?',
    o: [
      'Simple scaling policy responding to absolute CloudWatch threshold alarms',
      'Step scaling policy executing tiered adjustments based on metric ranges',
      'Target tracking scaling policy maintaining the desired 45% metric goal',
      'Scheduled scaling policy triggering scale-out actions by time of day'
    ],
    a: [2],
    cat: 'compute', diff: 'easy',
    tip: 'Target tracking scaling policies adjust ASG capacity dynamically to keep a specified metric (e.g., average CPU utilization or request count per target) at a target value.'
  },
  {
    q: 'A database on EC2 requires sustained performance of 100,000 IOPS and 99.999% storage durability. Which EBS volume type is specifically engineered for this requirement?',
    o: [
      'General Purpose SSD (gp2) scaling baseline IOPS with volume gigabytes',
      'General Purpose SSD (gp3) providing baseline 3,000 IOPS independently',
      'Provisioned IOPS SSD (io2 or io2 Block Express) with sub-ms latencies',
      'Throughput Optimized HDD (st1) maximizing sequential transfer rates'
    ],
    a: [2],
    cat: 'storage', diff: 'medium',
    tip: 'Provisioned IOPS SSD (io2 and io2 Block Express) volumes deliver up to 256,000 IOPS, sub-millisecond latency, and 99.999% durability. gp3 maxes out at 80,000 IOPS (64 TiB, 2,000 MiB/s) and 99.8%–99.9% durability.'
  },
  {
    q: 'A big data log-processing engine requires low-cost block storage to process massive, sequential streaming datasets. Storage does not need to be a boot volume. Which EBS volume type fits best?',
    o: [
      'Provisioned IOPS SSD (io2) engineered for mission-critical I/O operations',
      'General Purpose SSD (gp3) balancing cost and random IOPS flexibility',
      'Throughput Optimized HDD (st1) designed for large sequential reads/writes',
      'Cold HDD (sc1) optimized for cold, infrequently queried archival data'
    ],
    a: [2],
    cat: 'storage', diff: 'easy',
    tip: 'Throughput Optimized HDD (st1) is designed for large, sequential I/O workloads like MapReduce, Kafka, and log processing. Neither st1 nor sc1 can serve as an OS boot disk.'
  },
  {
    q: 'Which statement accurately describes EBS Multi-Attach capabilities?',
    o: [
      'Volumes can attach concurrently to instances across multiple AWS Regions',
      'io1/io2 volumes can attach to multiple Nitro instances within the same AZ',
      'Any gp3 volume can attach concurrently across multiple Availability Zones',
      'It provides a fully managed POSIX distributed file system automatically'
    ],
    a: [1],
    cat: 'storage', diff: 'medium',
    tip: 'EBS Multi-Attach is supported exclusively on io1/io2 volumes for Nitro-based instances within the SAME Availability Zone. It requires a cluster-aware file system (like GFS2) to prevent corruption.'
  },
  {
    q: 'You need to migrate an enterprise on-premises NetApp storage array to AWS with zero refactoring, maintaining support for NFS, SMB, and iSCSI protocols alongside SnapMirror replication. Which service is required?',
    o: [
      'Amazon Elastic File System (EFS) with Multi-AZ mount targets enabled',
      'Amazon FSx for Windows File Server integrated with Microsoft Active Directory',
      'Amazon FSx for NetApp ONTAP supporting multi-protocol enterprise storage',
      'Amazon FSx for OpenZFS delivering low-cost NFS file access over ZFS'
    ],
    a: [2],
    cat: 'storage', diff: 'medium',
    tip: 'FSx for NetApp ONTAP delivers multi-protocol support (NFS, SMB, iSCSI), storage deduplication, compression, and native integration with NetApp SnapMirror.'
  },
  {
    q: 'An on-premises virtual machine environment requires local, low-latency block storage volumes (iSCSI), while asynchronously backing up point-in-time volume snapshots to Amazon S3. Which hybrid service fits?',
    o: [
      'AWS Storage Gateway - Volume Gateway providing cloud-backed iSCSI storage',
      'AWS Storage Gateway - Tape Gateway replacing physical tape backup robotics',
      'Amazon FSx for Lustre linked directly with an Amazon S3 dataset repository',
      'AWS DataSync executing scheduled online block and object data transfers'
    ],
    a: [0],
    cat: 'storage', diff: 'medium',
    tip: 'Volume Gateway provides cloud-backed iSCSI block storage disks (Cached Volumes keep primary data in S3 with local cache; Stored Volumes keep full data locally and take snapshots to S3).'
  },
  {
    q: 'You need to connect an on-premises data center via Direct Connect to an AWS Transit Gateway that interconnects 30 VPCs. What type of Virtual Interface (VIF) must you create?',
    o: [
      'Private VIF attached directly to a regional Virtual Private Gateway',
      'Public VIF routing public AWS prefix endpoints over Direct Connect',
      'Transit VIF attached to a Direct Connect Gateway linked to the TGW',
      'Gateway VIF terminating on third-party software virtual appliances'
    ],
    a: [2],
    cat: 'hybrid', diff: 'medium',
    tip: 'A Transit Virtual Interface (Transit VIF) is strictly required to attach a Direct Connect connection (via a Direct Connect Gateway) directly to an AWS Transit Gateway.'
  },
  {
    q: 'A startup needs a 200 Mbps private dedicated hybrid connection to AWS but cannot afford the multi-week lead time or cost of a full physical 1 Gbps or 10 Gbps port. What should they order?',
    o: [
      'A dedicated Direct Connect connection with 1 Gbps physical fiber handoff',
      'A hosted Direct Connect connection through an AWS Direct Connect Partner',
      'An AWS Site-to-Site VPN configured with NAT-Traversal and static routing',
      'A Transit Gateway inter-region peering connection over the AWS backbone'
    ],
    a: [1],
    cat: 'hybrid', diff: 'easy',
    tip: 'Hosted connections are provisioned rapidly by AWS Direct Connect Partners in capacities from 50 Mbps up to 10 Gbps. Dedicated connections require provisioning 1 Gbps, 10 Gbps, or 100 Gbps dedicated physical ports.'
  },
  {
    q: 'You need to aggregate multiple IPsec VPN tunnels to exceed the default 1.25 Gbps per-tunnel bandwidth limit into your VPC architecture. What technology enables this?',
    o: [
      'Virtual Private Gateway (VGW) configured with multiple static routes',
      'Transit Gateway with Equal-Cost Multi-Path (ECMP) routing across tunnels',
      'VPC Peering connections configured with jumbo frame 9001 MTU support',
      'Application Load Balancers terminating incoming IPsec client tunnels'
    ],
    a: [1],
    cat: 'hybrid', diff: 'hard',
    tip: 'AWS Transit Gateway supports Equal-Cost Multi-Path (ECMP) routing across multiple BGP VPN tunnels, allowing you to scale total VPN bandwidth well beyond the 1.25 Gbps single-tunnel cap.'
  },
  {
    q: 'Which TWO services support Gateway VPC Endpoints powered by VPC route table prefix lists? (Choose TWO)',
    o: [
      'Amazon S3 (Simple Storage Service)',
      'Amazon DynamoDB (NoSQL Database)',
      'Amazon SQS (Simple Queue Service)',
      'Amazon SNS (Simple Notification Service)'
    ],
    a: [0, 1],
    m: 1,
    cat: 'vpc', diff: 'easy',
    tip: 'Only Amazon S3 and Amazon DynamoDB support Gateway VPC Endpoints (which modify VPC route tables for free). All other supported AWS services use Interface VPC Endpoints (PrivateLink).'
  },
  {
    q: 'Which TWO configurations are strictly required to establish a functioning AWS Site-to-Site VPN connection? (Choose TWO)',
    o: [
      'Customer Gateway (CGW) representing on-premises IP and ASN configuration',
      'Virtual Private Gateway (VGW) or Transit Gateway (TGW) target on AWS',
      'Internet Gateway attached directly to private subnet routing tables',
      'Direct Connect Gateway linked to an AWS-assigned Public Virtual Interface'
    ],
    a: [0, 1],
    m: 1,
    cat: 'hybrid', diff: 'easy',
    tip: 'A Site-to-Site VPN requires a Customer Gateway resource (on-premises side IP/BGP ASN) and an AWS-side target (either a Virtual Private Gateway or a Transit Gateway).'
  }
];