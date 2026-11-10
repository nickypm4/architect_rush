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

/* ============================ QUESTION DATA ============================
   D = diagram challenges. Fields:
     q    question text
     n    required nodes: { key: count }
     e    required links: [keyA, keyB, minCount = 1]
     tip  exam tip shown after grading
   Q = multiple choice. Fields: q, o (options), a (correct indexes), m (1 = choose two), tip   */

// ============================================================================
// TOPOLOGY DIAGRAM CHALLENGES (D)
// ============================================================================
export const D = [
  {
    q: 'Highly available outbound IPv4 internet for private instances across two AZs without single points of failure.',
    n: { ec2: 2, priv: 2, nat: 2, pub: 2, igw: 1 },
    e: [['ec2', 'priv', 2], ['ec2', 'nat', 2], ['nat', 'pub', 2], ['nat', 'igw', 2]],
    tip: 'NAT Gateways are AZ-scoped. High availability requires 1 NAT Gateway per AZ in a public subnet, each routed to an IGW, with each private subnet route table pointing 0.0.0.0/0 to its respective AZ’s NAT GW.'
  },
  {
    q: 'Standard secure 3-tier architecture: public internet users enter via an Internet Gateway to an Application Load Balancer in public subnets, routing to an Auto Scaling fleet in private subnets, querying a private Multi-AZ database.',
    n: { users: 1, igw: 1, pub: 1, alb: 1, asg: 1, ec2: 1, priv: 1, rds: 1 },
    e: [['users', 'igw'], ['igw', 'alb'], ['alb', 'pub'], ['alb', 'asg'], ['asg', 'priv'], ['asg', 'ec2'], ['ec2', 'rds']],
    tip: 'Public subnets host only the internet-facing ALB. Compute (EC2/ASG) and database (RDS Multi-AZ) remain in private subnets with strict security group isolation between tiers.'
  },
  {
    q: 'Accelerate a static web app globally while ensuring the S3 origin bucket is completely private and accessible exclusively through CloudFront.',
    n: { users: 1, cf: 1, s3: 1 },
    e: [['users', 'cf'], ['cf', 's3']],
    tip: 'CloudFront with Origin Access Control (OAC) prevents direct S3 bucket access. S3 bucket policy allows read access only to the CloudFront distribution principal.'
  },
  {
    q: 'Serve dynamic REST API endpoints from private instances via a load balancer, and serve static images/assets from an S3 bucket, through a single CDN distribution.',
    n: { users: 1, cf: 1, alb: 1, ec2: 1, s3: 1 },
    e: [['users', 'cf'], ['cf', 'alb'], ['cf', 's3'], ['alb', 'ec2']],
    tip: 'CloudFront behaviors allow path-pattern routing (e.g., /api/* to ALB origin, and default/* to S3 origin) under a single SSL certificate and domain name.'
  },
  {
    q: 'A global multiplayer UDP/TCP game requires 2 static Anycast IP addresses and instant failover to regional fleets behind high-throughput Layer 4 load balancers.',
    n: { users: 1, ga: 1, nlb: 2, ec2: 2 },
    e: [['users', 'ga'], ['ga', 'nlb', 2], ['nlb', 'ec2', 2]],
    tip: 'AWS Global Accelerator provides 2 static Anycast IPs, rides the AWS backbone, and supports TCP/UDP for fast failover to NLB endpoints. CloudFront only caches HTTP/HTTPS.'
  },
  {
    q: 'Transparently inspect all incoming internet traffic entering the VPC using a fleet of third-party firewall appliances before traffic reaches the workload.',
    n: { users: 1, igw: 1, gwlb: 1, appl: 2, ec2: 1 },
    e: [['users', 'igw'], ['igw', 'gwlb'], ['gwlb', 'appl', 2], ['gwlb', 'ec2']],
    tip: 'Gateway Load Balancer (GWLB) operates at Layer 3/4 (GENEVE protocol on port 6081) to transparently route VPC traffic to inline virtual appliances without altering source IP headers.'
  },
  {
    q: 'EC2 instances in a private subnet must access Amazon S3 buckets privately, without using the internet, and at zero additional hourly cost.',
    n: { ec2: 1, priv: 1, rtb: 1, vpce: 1, s3: 1 },
    e: [['ec2', 'priv'], ['priv', 'rtb'], ['rtb', 'vpce'], ['vpce', 's3']],
    tip: 'Gateway VPC Endpoints (for S3 and DynamoDB only) are completely free and route traffic through a VPC route table prefix list entry. Interface Endpoints (PrivateLink) incur hourly and data charges.'
  },
  {
    q: 'Private EC2 instances must push messages to Amazon SQS privately without an internet gateway, NAT gateway, or public IPs.',
    n: { ec2: 1, priv: 1, pl: 1, sqs: 1 },
    e: [['ec2', 'priv'], ['priv', 'pl'], ['pl', 'sqs']],
    tip: 'SQS does not support Gateway Endpoints. An Interface VPC Endpoint (powered by AWS PrivateLink) creates an ENI inside your private subnet with a private IP.'
  },
  {
    q: 'A SaaS vendor in VPC 1 must expose its application service securely to customer consumers in VPC 2, where both VPCs share the exact same 10.0.0.0/16 CIDR.',
    n: { ec2: 1, nlb: 1, pl: 1, vpc: 2 },
    e: [['ec2', 'nlb'], ['nlb', 'vpc'], ['pl', 'vpc'], ['nlb', 'pl']],
    tip: 'VPC Peering fails with overlapping CIDRs. AWS PrivateLink (NLB on the service provider side + Interface Endpoint on the consumer side) connects isolated services across overlapping IP ranges.'
  },
  {
    q: 'Connect three VPCs and an on-premises data center over VPN so all can communicate with each other, avoiding the operational complexity of a full-mesh peering topology.',
    n: { vpc: 3, tgw: 1, vpn: 1, onprem: 1 },
    e: [['vpc', 'tgw', 3], ['tgw', 'vpn'], ['vpn', 'onprem']],
    tip: 'Transit Gateway functions as a cloud router supporting transitive routing across thousands of VPCs and VPN/Direct Connect connections, eliminating the N(N-1)/2 mesh overhead of peering.'
  },
  {
    q: 'Connect two VPCs with non-overlapping CIDRs across two different AWS Regions privately and at the lowest possible data transfer cost, ensuring routing tables are properly configured.',
    n: { vpc: 2, peer: 1, rtb: 2 },
    e: [['vpc', 'peer', 2], ['vpc', 'rtb', 2]],
    tip: 'Inter-Region VPC Peering is the simplest and most cost-effective way to link two VPCs directly. Both route tables must be explicitly updated with the peer’s CIDR.'
  },
  {
    q: 'Establish a single 10 Gbps Direct Connect physical connection from on-premises to access workloads hosted across VPCs located in two distinct AWS Regions.',
    n: { onprem: 1, dx: 1, dxgw: 1, vpc: 2 },
    e: [['onprem', 'dx'], ['dx', 'dxgw'], ['dxgw', 'vpc', 2]],
    tip: 'A Direct Connect Gateway (DXGW) is a global resource that links a Direct Connect connection (via Private VIFs) to Virtual Private Gateways in multiple AWS Regions.'
  },
  {
    q: 'Deploy high-availability hybrid connectivity to a VPC using a dedicated private link as primary, with an encrypted internet-based automatic failover link.',
    n: { onprem: 1, dx: 1, vpn: 1, vgw: 1, vpc: 1 },
    e: [['onprem', 'dx'], ['onprem', 'vpn'], ['dx', 'vgw'], ['vpn', 'vgw'], ['vgw', 'vpc']],
    tip: 'Direct Connect (primary) with Site-to-Site VPN (backup) attached to the same VGW delivers cost-effective resilience. BGP routes over DX automatically take precedence over VPN due to AS PATH length.'
  },
  {
    q: 'Corporate policy mandates that all traffic traveling over a dedicated Direct Connect link into a VPC must be cryptographically encrypted in transit with IPsec.',
    n: { onprem: 1, dx: 1, vpn: 1, vgw: 1, vpc: 1 },
    e: [['onprem', 'dx'], ['dx', 'vpn'], ['vpn', 'vgw'], ['vgw', 'vpc']],
    tip: 'Direct Connect is private but unencrypted by default. Establish a public VIF on Direct Connect and run an IPsec Site-to-Site VPN tunnel inside it to the VPC.'
  },
  {
    q: 'Interconnect two remote branch offices to each other and to an AWS VPC using existing internet connections, without backhauling traffic through corporate HQ.',
    n: { onprem: 2, vpn: 2, vgw: 1, vpc: 1 },
    e: [['onprem', 'vpn', 2], ['vpn', 'vgw', 2], ['vgw', 'vpc']],
    tip: 'AWS VPN CloudHub allows multiple Site-to-Site VPN connections to terminate on a single Virtual Private Gateway with BGP, enabling branch sites to communicate directly through AWS.'
  },
  {
    q: 'A central networking account owns the VPC and routing topology. Allow workload accounts in an AWS Organization to launch EC2 instances directly into the central private subnet.',
    n: { ram: 1, vpc: 1, priv: 1, ec2: 2 },
    e: [['ram', 'priv'], ['priv', 'vpc'], ['ec2', 'priv', 2]],
    tip: 'AWS Resource Access Manager (RAM) shares subnets across an AWS Organization. Workload owners manage their instances, while networking admins retain control of VPC CIDRs, subnets, and route tables.'
  },
  {
    q: 'On-premises servers must resolve private domain names hosted in a Route 53 Private Hosted Zone over an existing hybrid VPN.',
    n: { onprem: 1, vpn: 1, r53r: 1, vpc: 1, phz: 1 },
    e: [['onprem', 'vpn'], ['vpn', 'r53r'], ['r53r', 'vpc'], ['vpc', 'phz']],
    tip: 'Route 53 Resolver Inbound Endpoints deliver IP addresses in your VPC for on-premises DNS forwarders to query private records in AWS Private Hosted Zones.'
  },
  {
    q: 'EC2 instances in a VPC must query corporate internal domain names (corp.internal) hosted on data center DNS servers over a hybrid link.',
    n: { ec2: 1, vpc: 1, r53out: 1, vpn: 1, onprem: 1 },
    e: [['ec2', 'vpc'], ['vpc', 'r53out'], ['r53out', 'vpn'], ['vpn', 'onprem']],
    tip: 'Route 53 Resolver Outbound Endpoints and Resolver forwarding rules route DNS queries matching specific on-premises domains from AWS back to your data center DNS servers.'
  },
  {
    q: 'Protect an Application Load Balancer and its backend web instances against SQL injection and HTTP flood attacks directly at the AWS edge before traffic hits the VPC.',
    n: { users: 1, cf: 1, waf: 1, alb: 1, ec2: 1 },
    e: [['users', 'cf'], ['cf', 'waf'], ['cf', 'alb'], ['alb', 'ec2']],
    tip: 'AWS WAF attaches directly to CloudFront distributions to inspect, filter, and rate-limit HTTP/HTTPS traffic at edge locations worldwide, shielding the origin ALB and EC2 servers.'
  },
  {
    q: 'Direct web traffic to an Application Load Balancer, but automatically fail over DNS to a static error website hosted in Amazon S3 when ALB health checks fail.',
    n: { users: 1, r53: 1, hc: 1, alb: 1, s3: 1 },
    e: [['users', 'r53'], ['r53', 'alb'], ['r53', 's3'], ['hc', 'alb']],
    tip: 'Route 53 Failover routing requires a Health Check monitoring the primary ALB endpoint. If unhealthy, Route 53 routes incoming DNS queries to the secondary S3 website record.'
  },
  {
    q: 'Implement defense-in-depth in a public subnet: evaluate inbound traffic with a stateless network filter, then with a stateful host filter on the EC2 instance.',
    n: { pub: 1, nacl: 1, ec2: 1, sg: 1 },
    e: [['pub', 'nacl'], ['pub', 'ec2'], ['ec2', 'sg']],
    tip: 'NACLs are stateless subnet-level firewalls evaluating numbered allow/deny rules. Security Groups are stateful ENI-level firewalls with allow-only rules.'
  },
  {
    q: 'Allow network administrators on the public internet to securely SSH into private application instances via a dedicated bastion host located in a public subnet.',
    n: { users: 1, igw: 1, pub: 1, ec2: 2, priv: 1 },
    e: [['users', 'igw'], ['igw', 'ec2'], ['ec2', 'pub'], ['ec2', 'priv']],
    tip: 'The bastion EC2 host resides in the public subnet with an Elastic IP. The private instances’ security group permits SSH port 22 strictly from the bastion’s security group.'
  },
  {
    q: 'Two Linux EC2 instances in different Availability Zones require concurrent read-write access to a shared POSIX file system, secured by a dedicated security group.',
    n: { ec2: 2, efs: 1, sg: 1 },
    e: [['ec2', 'efs', 2], ['efs', 'sg'], ['ec2', 'sg', 2]],
    tip: 'Amazon EFS provides concurrent NFSv4 access across multiple AZs. EFS mount targets use security groups permitting inbound TCP port 2049 exclusively from the client instances.'
  },
  {
    q: 'Automatically move rarely accessed files on a shared Linux file system to a low-cost storage tier after 30 days of inactivity without disrupting client mount paths.',
    n: { ec2: 2, efs: 1, efsia: 1 },
    e: [['ec2', 'efs', 2], ['efs', 'efsia']],
    tip: 'EFS Lifecycle Management transparently transitions files unaccessed for N days to EFS Infrequent Access (IA), slashing storage costs while remaining accessible under the same POSIX mount.'
  },
  {
    q: 'Two Windows EC2 instances require a fully managed SMB shared file system integrated with Microsoft Active Directory and NTFS permissions.',
    n: { ec2: 2, fsx: 1 },
    e: [['ec2', 'fsx', 2]],
    tip: 'FSx for Windows File Server provides native SMB shares, Active Directory integration, and NTFS access control lists. EFS is POSIX/NFS for Linux only.'
  },
  {
    q: 'An HPC compute cluster requires a POSIX-compliant, sub-millisecond file system pre-loaded from an Amazon S3 dataset that can write back computation results.',
    n: { ec2: 2, lus: 1, s3: 1 },
    e: [['ec2', 'lus', 2], ['lus', 's3']],
    tip: 'FSx for Lustre is optimized for HPC and machine learning, offering native two-way synchronization with Amazon S3 data repositories and parallel processing throughput.'
  },
  {
    q: 'A tightly coupled scientific simulation requires OS-bypass networking and the absolute lowest inter-node network latency between EC2 instances.',
    n: { ec2: 2, pg: 1, efa: 2 },
    e: [['ec2', 'pg', 2], ['ec2', 'efa', 2]],
    tip: 'An Elastic Fabric Adapter (EFA) provides OS-bypass capability for MPI workloads. Pairing EFA with a Cluster Placement Group ensures physical rack proximity with ultra-low latency.'
  },
  {
    q: 'On-premises applications requiring low-latency local NFS file access must store and retain their primary data in Amazon S3 buckets.',
    n: { onprem: 1, sgw: 1, s3: 1 },
    e: [['onprem', 'sgw'], ['sgw', 's3']],
    tip: 'AWS Storage Gateway (S3 File Gateway) caches active files locally on-premises via NFS/SMB while persisting objects directly in Amazon S3 for durable, cost-effective storage.'
  },
  {
    q: 'Migrate an existing unencrypted production EBS volume to an encrypted EBS volume using customer-managed AWS KMS keys without data loss.',
    n: { ec2: 1, ebs: 1, snap: 1, kms: 1 },
    e: [['ec2', 'ebs'], ['ebs', 'snap'], ['snap', 'kms']],
    tip: 'You cannot encrypt an existing EBS volume in place. Take a snapshot, copy the snapshot while enabling KMS encryption, and restore a new encrypted volume from that copy.'
  },
  {
    q: 'Decouple background worker EC2 instances from API web servers, scaling the worker Auto Scaling fleet dynamically based on pending message volume.',
    n: { sqs: 1, cw: 1, asg: 1, ec2: 2 },
    e: [['ec2', 'sqs', 2], ['cw', 'sqs'], ['cw', 'asg'], ['asg', 'ec2', 2]],
    tip: 'Worker instances scale horizontally using CloudWatch Alarms monitoring the SQS metric ApproximateNumberOfMessagesVisible, decoupling workload surges from processing capacity.'
  },
  {
    q: 'Minimize compute expenses for a stateless web application by maintaining a baseline of guaranteed On-Demand instances combined with Spot Instances for demand spikes.',
    n: { alb: 1, asg: 1, od: 1, spot: 1 },
    e: [['alb', 'asg'], ['asg', 'od'], ['asg', 'spot']],
    tip: 'An ASG Mixed Instances Policy mixes On-Demand instances (guaranteed baseline availability) with Spot Instances (up to 90% discount for burst capacity) across multiple instance types.'
  },
  {
    q: 'Route global web users automatically to the AWS Region delivering the fastest response times, each running an independent Application Load Balancer and fleet.',
    n: { users: 1, r53: 1, alb: 2, ec2: 2 },
    e: [['users', 'r53'], ['r53', 'alb', 2], ['alb', 'ec2', 2]],
    tip: 'Route 53 Latency-Based Routing queries network latency measurements between client IPs and AWS Regions, routing users to the specific ALB target group with the lowest round-trip time.'
  }
];

// ============================================================================
// EXAM DECISION QUESTIONS (Q)
// ============================================================================
export const Q = [
  {
    q: 'How many usable IPv4 addresses are available in a /24 VPC subnet?',
    o: ['256', '254', '251', '250'],
    a: [2],
    tip: 'AWS reserves 5 IP addresses in every subnet: Network (.0), VPC Router (.1), Amazon DNS (.2), Future Use (.3), and Broadcast (.255).'
  },
  {
    q: 'What are the minimum and maximum allowable IPv4 CIDR prefix lengths for an Amazon VPC?',
    o: ['/8 minimum, /24 maximum', '/16 minimum, /28 maximum', '/16 minimum, /32 maximum', '/20 minimum, /28 maximum'],
    a: [1],
    tip: 'A VPC IPv4 CIDR block can be between /16 (65,536 addresses) and /28 (16 addresses).'
  },
  {
    q: 'An EC2 web server allows inbound port 443 in its Security Group, and the subnet NACL allows inbound port 443. However, web clients time out. What is missing?',
    o: ['Outbound rule for ephemeral ports (1024-65535) in the NACL', 'Outbound rule for port 443 in the Security Group', 'An Elastic IP attached to the NACL', 'A NAT Gateway in the public subnet'],
    a: [0],
    tip: 'Network ACLs are STATELESS. Response traffic returning to the client uses an ephemeral port (1024–65535) and must be explicitly allowed outbound in the NACL. Security Groups are stateful and track connections automatically.'
  },
  {
    q: 'What is the most secure and maintainable way to allow EC2 instances in an application tier to communicate with database instances in an RDS tier?',
    o: ['Allow database port inbound from 0.0.0.0/0', 'Authorize the Application Security Group ID as the source in the Database Security Group', 'Add the private IP address of every application instance to the Database NACL', 'Place both tiers into the same public subnet'],
    a: [1],
    tip: 'Security Groups can reference other Security Group IDs as sources or destinations. When application instances scale out or change IPs, the database tier remains securely accessible without manual rule updates.'
  },
  {
    q: 'An Application Load Balancer terminates client HTTPS connections. How does the target application server inspect the client’s real IP address?',
    o: ['Via the TCP source IP', 'Via the X-Forwarded-For HTTP request header', 'Via the Host header', 'Via Proxy Protocol v1'],
    a: [1],
    tip: 'Because an ALB terminates the TCP/HTTP connection, backend targets see the ALB’s private IP as the network source. The original client IP is recorded in the X-Forwarded-For header.'
  },
  {
    q: 'You must redirect all HTTP requests on port 80 to HTTPS port 443 on an Application Load Balancer without changing application code. What is the optimal solution?',
    o: ['Deploy an extra Network Load Balancer in front of the ALB', 'Configure an HTTP listener redirect rule directly on the ALB', 'Write an Apache/Nginx rewrite rule on every EC2 instance', 'Use Route 53 Weighted routing to rewrite the port'],
    a: [1],
    tip: 'ALB listeners natively support redirect actions (e.g., HTTP 301/302 from port 80 to 443) directly on the load balancer, requiring zero backend instance overhead.'
  },
  {
    q: 'Which load balancer behavior is enabled by default at NO extra charge for inter-AZ data transfer?',
    o: ['Cross-zone balancing on Network Load Balancers', 'Cross-zone balancing on Application Load Balancers', 'Cross-zone balancing on Gateway Load Balancers', 'Stickiness on Classic Load Balancers'],
    a: [1],
    tip: 'ALB has cross-zone load balancing enabled by default with zero inter-AZ data transfer fees. For NLB and GWLB, cross-zone is disabled by default and incurs inter-AZ data charges if enabled.'
  },
  {
    q: 'One Application Load Balancer hosts multiple websites with distinct domain names (api.corp.com and portal.corp.com), each requiring its own SSL certificate. What feature makes this possible?',
    o: ['Server Name Indication (SNI)', 'Sticky Sessions', 'Deregistration Delay', 'Proxy Protocol v2'],
    a: [0],
    tip: 'Server Name Indication (SNI) allows an ALB to bind multiple SSL/TLS certificates to a single secure listener, serving the matching certificate based on the hostname requested in the TLS handshake.'
  },
  {
    q: 'You need to point the DNS zone apex (example.com) to an Application Load Balancer. Which Route 53 record type is required?',
    o: ['CNAME record', 'Alias A record', 'TXT record', 'PTR record'],
    a: [1],
    tip: 'DNS standards do not permit CNAME records at the zone apex. Route 53 provides Alias records (free of query charges) to map apex domains directly to AWS resources like ALBs and CloudFront.'
  },
  {
    q: 'Which Route 53 routing policy returns up to eight healthy IP records in response to a DNS query to provide client-side load balancing and health checks?',
    o: ['Simple routing', 'Multivalue Answer routing', 'Latency-based routing', 'Geolocation routing'],
    a: [1],
    tip: 'Multivalue Answer routing responds to DNS queries with up to 8 randomly selected healthy resource records and integrates with Route 53 health checks, unlike Simple routing.'
  },
  {
    q: 'A legal compliance rule dictates that European users must be routed strictly to servers in Frankfurt, while US users must be routed to Virginia. Which Route 53 policy applies?',
    o: ['Latency routing', 'Geolocation routing', 'Geoproximity routing', 'Weighted routing'],
    a: [1],
    tip: 'Geolocation routing maps DNS traffic based on the geographic location of the client (continent, country, or US state), essential for compliance and localization. Geoproximity routes by distance and requires Traffic Flow bias.'
  },
  {
    q: 'Paid subscribers need temporary, secure access to hundreds of private video and data files distributed through CloudFront. What mechanism should you implement?',
    o: ['A CloudFront Signed URL for each file', 'CloudFront Signed Cookies', 'S3 Bucket Public Read ACL', 'A Route 53 Weighted DNS policy'],
    a: [1],
    tip: 'Signed Cookies provide access to multiple restricted files (or an entire streaming directory) without changing individual URLs. Signed URLs are best for single file access.'
  },
  {
    q: 'You need to perform sub-millisecond URL rewrites and HTTP header manipulations on incoming viewer requests directly at edge locations with minimal cost and execution time. What should you use?',
    o: ['Lambda@Edge', 'CloudFront Functions', 'EC2 instance in every Region', 'API Gateway Edge-Optimized Endpoint'],
    a: [1],
    tip: 'CloudFront Functions execute lightweight JavaScript in sub-milliseconds at edge locations for viewer request/response events. Lambda@Edge supports Node/Python, larger payloads, and origin-facing events.'
  },
  {
    q: 'A steady 3-year production workload runs continuously across multiple EC2 instance families, different Regions, and may partially migrate to AWS Fargate. Which pricing model offers the highest discount and flexibility?',
    o: ['Standard EC2 Reserved Instances', 'Compute Savings Plans', 'EC2 Instance Savings Plans', 'Dedicated Hosts'],
    a: [1],
    tip: 'Compute Savings Plans offer up to 66% discounts and automatically apply across instance families, OS, AWS Regions, and also cover AWS Fargate and AWS Lambda.'
  },
  {
    q: 'A company needs dedicated physical hardware to satisfy regulatory per-core and per-socket software licensing agreements (BYOL). What EC2 purchase model is required?',
    o: ['Dedicated Instances', 'Dedicated Hosts', 'Spot Instances', 'On-Demand Capacity Reservations'],
    a: [1],
    tip: 'EC2 Dedicated Hosts provide full visibility into socket and physical core counts, allowing you to use existing server-bound software licenses. Dedicated Instances only ensure single-tenant hardware isolation.'
  },
  {
    q: 'You need guaranteed EC2 compute capacity in a specific Availability Zone for a planned disaster recovery event next week, but do not want a 1-year or 3-year financial commitment. What do you provision?',
    o: ['On-Demand Capacity Reservation', 'Regional Reserved Instance', 'Spot Fleet', 'Compute Savings Plan'],
    a: [0],
    tip: 'On-Demand Capacity Reservations guarantee compute capacity in a specific AZ for any duration with no long-term commitment. You are billed at On-Demand rates until cancelled.'
  },
  {
    q: 'Seven mission-critical database instances must run on completely isolated physical hardware racks with separate power and network sources. Which placement group should you use?',
    o: ['Cluster placement group', 'Spread placement group', 'Partition placement group', 'None (default multi-AZ)'],
    a: [1],
    tip: 'Spread placement groups place each instance on distinct physical hardware racks (up to a strict limit of 7 instances per AZ) to eliminate correlated hardware failures.'
  },
  {
    q: 'Which storage option offers the lowest latency and highest random IOPS for temporary scratch files, caching, and buffers, where data loss upon instance stoppage is acceptable?',
    o: ['EBS gp3 volume', 'EC2 Instance Store', 'Amazon EFS', 'Amazon S3 Glacier Instant Retrieval'],
    a: [1],
    tip: 'EC2 Instance Store disks are physically attached NVMe/SATA SSDs that offer millions of IOPS and microsecond latencies, but storage is ephemeral (erased on stop or termination).'
  },
  {
    q: 'A slow-starting application takes 20 minutes to load machine learning models into RAM. You need to stop the instance overnight and resume its memory state immediately upon startup. What should you configure?',
    o: ['EC2 Hibernation', 'EC2 Stop and Start with gp3', 'Instance Reboot', 'Elastic Fabric Adapter'],
    a: [0],
    tip: 'EC2 Hibernation saves volatile in-memory (RAM) state to the encrypted root EBS volume. Upon starting, the instance boots directly from the preserved RAM state.'
  },
  {
    q: 'A licensed third-party application is bound to a specific MAC address and private IPv4 address. When replacing the instance, how can the new instance inherit these attributes immediately in the same AZ?',
    o: ['Allocate a new Elastic IP', 'Detach the secondary Elastic Network Interface (ENI) and reattach it to the replacement instance', 'Move the EBS volume to another subnet', 'Create a new placement group'],
    a: [1],
    tip: 'An Elastic Network Interface (ENI) retains its private IP, MAC address, and security groups. It can be dynamically detached from a failed instance and attached to another instance in the same AZ.'
  },
  {
    q: 'You must run a custom log-collection script on EC2 instances to upload unsaved telemetry to S3 before an Auto Scaling group terminates them during a scale-in event. What feature should you implement?',
    o: ['ASG Cooldown Period', 'ASG Lifecycle Hook', 'Target Tracking Policy', 'CloudWatch Synthetic Canary'],
    a: [1],
    tip: 'Auto Scaling Lifecycle Hooks pause instance termination (or launch), placing the instance in a Pending:Wait or Terminating:Wait state so custom cleanup scripts or log drains can complete.'
  },
  {
    q: 'You need an Auto Scaling policy that automatically acts like a thermostat to keep average fleet CPU utilization close to 45%. Which policy type should you select?',
    o: ['Simple scaling policy', 'Step scaling policy', 'Target tracking scaling policy', 'Scheduled scaling policy'],
    a: [2],
    tip: 'Target tracking scaling policies adjust ASG capacity dynamically to keep a specified metric (e.g., average CPU utilization or request count per target) at a target value.'
  },
  {
    q: 'A database on EC2 requires sustained performance of 64,000 IOPS and 99.999% storage durability. Which EBS volume type is specifically engineered for this requirement?',
    o: ['General Purpose SSD (gp2)', 'General Purpose SSD (gp3)', 'Provisioned IOPS SSD (io2 or io2 Block Express)', 'Throughput Optimized HDD (st1)'],
    a: [2],
    tip: 'Provisioned IOPS SSD (io2 and io2 Block Express) volumes deliver up to 256,000 IOPS, sub-millisecond latency, and 99.999% volume durability. gp3 maxes out at 16,000 IOPS.'
  },
  {
    q: 'A big data log-processing engine requires low-cost block storage to process massive, sequential streaming datasets. Storage does not need to be a boot volume. Which EBS volume type fits best?',
    o: ['Provisioned IOPS (io2)', 'General Purpose (gp3)', 'Throughput Optimized HDD (st1)', 'Cold HDD (sc1)'],
    a: [2],
    tip: 'Throughput Optimized HDD (st1) is designed for large, sequential I/O workloads like MapReduce, Kafka, and log processing. Neither st1 nor sc1 can serve as an OS boot disk.'
  },
  {
    q: 'Which statement accurately describes EBS Multi-Attach capabilities?',
    o: ['Volumes can attach to instances across multiple AWS Regions', 'io1/io2 volumes can attach to multiple Nitro instances concurrently within the same AZ', 'Any gp3 volume can attach concurrently across multiple AZs', 'It provides a managed distributed file system automatically'],
    a: [1],
    tip: 'EBS Multi-Attach is supported exclusively on io1/io2 volumes for Nitro-based instances within the SAME Availability Zone. It requires a cluster-aware file system (like GFS2) to prevent corruption.'
  },
  {
    q: 'You need to migrate an enterprise on-premises NetApp storage array to AWS with zero refactoring, maintaining support for NFS, SMB, and iSCSI protocols alongside SnapMirror replication. Which service is required?',
    o: ['Amazon EFS', 'Amazon FSx for Windows File Server', 'Amazon FSx for NetApp ONTAP', 'Amazon FSx for OpenZFS'],
    a: [2],
    tip: 'FSx for NetApp ONTAP delivers multi-protocol support (NFS, SMB, iSCSI), storage deduplication, compression, and native integration with NetApp SnapMirror.'
  },
  {
    q: 'An on-premises virtual machine environment requires local, low-latency block storage volumes (iSCSI), while asynchronously backing up point-in-time volume snapshots to Amazon S3. Which hybrid service fits?',
    o: ['AWS Storage Gateway - Volume Gateway', 'AWS Storage Gateway - Tape Gateway', 'Amazon FSx for Lustre', 'AWS DataSync'],
    a: [0],
    tip: 'Volume Gateway provides cloud-backed iSCSI block storage disks (Cached Volumes keep primary data in S3 with local cache; Stored Volumes keep full data locally and take snapshots to S3).'
  },
  {
    q: 'You need to connect an on-premises data center via Direct Connect to an AWS Transit Gateway that interconnects 30 VPCs. What type of Virtual Interface (VIF) must you create?',
    o: ['Private VIF', 'Public VIF', 'Transit VIF', 'Gateway VIF'],
    a: [2],
    tip: 'A Transit Virtual Interface (Transit VIF) is strictly required to attach a Direct Connect connection (via a Direct Connect Gateway) directly to an AWS Transit Gateway.'
  },
  {
    q: 'A startup needs a 200 Mbps private dedicated hybrid connection to AWS but cannot afford the multi-week lead time or cost of a full physical 1 Gbps or 10 Gbps port. What should they order?',
    o: ['A dedicated Direct Connect connection', 'A hosted Direct Connect connection through an AWS Direct Connect Partner', 'An AWS Site-to-Site VPN with NAT-T', 'A Transit Gateway peering attachment'],
    a: [1],
    tip: 'Hosted connections are provisioned rapidly by AWS Direct Connect Partners in capacities from 50 Mbps up to 10 Gbps. Dedicated connections require provisioning 1 Gbps, 10 Gbps, or 100 Gbps dedicated physical ports.'
  },
  {
    q: 'You need to aggregate multiple IPsec VPN tunnels to exceed the default 1.25 Gbps per-tunnel bandwidth limit into your VPC architecture. What technology enables this?',
    o: ['Virtual Private Gateway (VGW)', 'Transit Gateway with Equal-Cost Multi-Path (ECMP)', 'VPC Peering with jumbo frames', 'Application Load Balancer across tunnels'],
    a: [1],
    tip: 'AWS Transit Gateway supports Equal-Cost Multi-Path (ECMP) routing across multiple BGP VPN tunnels, allowing you to scale total VPN bandwidth well beyond the 1.25 Gbps single-tunnel cap.'
  },
  {
    q: 'Which TWO services support Gateway VPC Endpoints powered by VPC route table prefix lists? (Choose TWO)',
    o: ['Amazon S3', 'Amazon DynamoDB', 'Amazon SQS', 'Amazon SNS'],
    a: [0, 1],
    m: 1,
    tip: 'Only Amazon S3 and Amazon DynamoDB support Gateway VPC Endpoints (which modify VPC route tables for free). All other supported AWS services use Interface VPC Endpoints (PrivateLink).'
  },
  {
    q: 'Which TWO configurations are strictly required to establish a functioning AWS Site-to-Site VPN connection? (Choose TWO)',
    o: ['Customer Gateway (CGW) representing the on-premises device', 'Virtual Private Gateway (VGW) or Transit Gateway (TGW) on AWS', 'Internet Gateway attached to the private subnet', 'Direct Connect Gateway linked to a Public VIF'],
    a: [0, 1],
    m: 1,
    tip: 'A Site-to-Site VPN requires a Customer Gateway resource (on-premises side IP/BGP ASN) and an AWS-side target (either a Virtual Private Gateway or a Transit Gateway).'
  }
];